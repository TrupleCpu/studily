from flask import jsonify, render_template_string
from service.cerebras import call_ai
from lib.randomize import randomize_questions_answers
import re
import io
import json
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
def generate_study_material(clean_data):
   
    flashcard_prompt = f"""You are an AI study assistant. 

    Your task is to generate **up to 20 flashcards** from the following lecture content.

    Rules:
    1. Each flashcard must have:
    - "id" (a unique number starting from 1)
    - "question" (short, clear, and answerable from the content)
    - "answer" (concise, accurate, and include examples if they exist in the content)
    2. Do NOT invent any information not in the lecture.
    3. Keep answers short but complete.
    4. Generate **no more than 20 flashcards**.
    5. Output valid JSON matching this TypeScript type:

    export type FlashCardProps = {{
        id: number;
        question: string;
        answer: string;
    }};    

    6. Do not add extra text, explanations, or comments. Only output JSON.

    Lecture content:
    {clean_data}
    """

    flashcard_response = call_ai(flashcard_prompt)
    flashcard_stripped = re.sub(r"```json|```", "", flashcard_response).strip()

    try:
        flashcards = json.loads(flashcard_stripped)
        flashcards = flashcards[:20]
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse flashcards", "raw": flashcard_response}), 500

    flashcard_text = "\n".join([f"{fc['id']}. Q: {fc['question']} A: {fc['answer']}" for fc in flashcards])

    quiz_prompt = f"""
    You are an AI study assistant.

    Your task is to generate **up to 20 quiz questions** based on the following flashcards.

    Rules:
    1. Each quiz question must have:
    - "id" (a unique number starting from 1)
    - "question" (short, clear, and answerable from the flashcards)
    - "options" (an array of 3-5 possible answers)
    - "correctIndex" (the index of the correct answer in the "options" array, starting from 0)
        - The correct answer must be placed at a **random position** in the "options" array.
        - The options must be **shuffled** so the order is different for each question.
    2. Do NOT invent any information not in the flashcards.
    3. Make the questions varied: multiple choice, true/false, or concept recall.
    4. Keep answers concise.
    5. Generate **no more than 20 quiz questions**.
    6. Output valid JSON matching this TypeScript type:

    IMPORTANT: For each question, place the correct answer at a **random position** within the options array.
    Ensure that the correct answer’s index (`correctIndex`) varies unpredictably across questions, and is not always the same number or pattern.
    Do NOT fix the correctIndex to a specific value like 0 or 1 repeatedly.
    Shuffle the options so the correct answer can appear anywhere from index 0 to the last option.


    export type DefaultQuizProps = {{
        id: number;
        question: string;
        options: string[];
        correctIndex: number;
    }};

    7. Only output JSON — do not add explanations, notes, or any extra text.
    8. Ensure each question has **3–5 options**, the correct answer is included, and the order is randomized.

    Flashcards:
    {flashcard_text}
    """


    quiz_response = call_ai(quiz_prompt)
    quiz_stripped = re.sub(r"```json|```", "", quiz_response).strip()
    try:
        quizcards = json.loads(quiz_stripped)
        quiz_randomized = randomize_questions_answers(quizcards)
        quizcards = quiz_randomized[:20]  
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse quizcards", "raw": quiz_response}), 500

    return {"flashcards": flashcards, "quizcards": quizcards}


def generate_explanation(answer, question):
    prompt = (
        f"Question: {question}\n"
        f"Answer: {answer}\n\n"
        "Write a short student-friendly explanation. "
        "First sentence: restate what the question is asking in simple words. "
        "Second sentence: explain what the answer means. "
        "Do not justify or argue why it is correct. "
        "Keep it concise."
    )

    explanation_response = call_ai(prompt)
    return {"explanation": explanation_response}

def generate_hint(question, options):
    prompt = (
        f'Provide a subtle hint for this multiple choice question: "{question}". '
        f'The options are {", ".join(options)}. '
        'Hint should gently guide the student toward the correct answer by focusing on key clues, '
        'but do NOT reveal the answer. Keep it concise and under 20 words.'
    )

    hint_response = call_ai(prompt)
    return {"hint": hint_response}

def generate_pdf(allQA):
    pdf_buffer = io.BytesIO()
 
    available_width = A4[0] - (4 * cm)
    
    doc = SimpleDocTemplate(
        pdf_buffer, 
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1, # Center
        textColor=colors.HexColor('#2c3e50')
    )
    
    question_style = ParagraphStyle(
        'Question',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=5,
        textColor=colors.HexColor('#27ae60'),
        fontName='Helvetica-Bold'
    )
    
    answer_style = ParagraphStyle(
        'Answer',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#333333')
    )

    story = []
    
    story.append(Paragraph("Reviewer: Studily-FlashCards", title_style))
    story.append(Spacer(1, 12))
    
    for item in allQA:
       
        q_text = f"Q: {item.get('question', '')}"
        a_text = f"A: {item.get('answer', '')}"
        
        cell_content = [
            Paragraph(q_text, question_style),
            Spacer(1, 6),
            Paragraph(a_text, answer_style)
        ]
        
        
        card_table = Table([[cell_content]], colWidths=[available_width])
        
        card_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f9f9f9')),
            
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#27ae60')),
            
            ('LEFTPADDING', (0,0), (-1,-1), 15),
            ('RIGHTPADDING', (0,0), (-1,-1), 15),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            
             ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
        ]))
        
        # Add the card to the story
        story.append(card_table)
        
        story.append(Spacer(1, 15))

    try:
        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer
    except Exception as e:
        print(f"ReportLab Error: {e}")
        return None
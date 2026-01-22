from flask import Blueprint, request, jsonify,send_file
from lib.extract_lib import extract_text_from_ppt, extract_text_from_pdf, extract_text_from_docx
from service.generate_service import generate_study_material, generate_explanation, generate_hint, generate_pdf
from lib.slides_to_text import slides_to_text
from service.cerebras import call_ai
from flask_cors import CORS
import os
from dotenv import load_dotenv
import re

load_dotenv()


extract_bp = Blueprint('extract_bp', __name__)
CORS(extract_bp, origins=os.getenv("API_BASE_URL"), supports_credentials=True)
@extract_bp.route('/upload-file', methods=['POST'])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    quizCount = int(request.form.get("quizCount"))
    flashcardCount = int(request.form.get("flashcardCount"))
    filename = file.filename.lower()
    file_bytes = file.read()
    
    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(".pptx"):
        slides_data = extract_text_from_ppt(file_bytes)
        text = slides_to_text(slides_data)
        text = re.sub(r'\s+', ' ', text).strip()  # clean whitespace
    elif filename.endswith(".docx"):
        text = extract_text_from_docx(file_bytes)
    else:
        return jsonify({"error": "Unsupported file type"}), 400
    
    materials = generate_study_material(text, quizCount, flashcardCount)
    return jsonify(materials)


@extract_bp.route('/explain', methods=['POST'])
def explain_answer():
    
    data = request.get_json()

    if not data:
        return jsonify({"error": "No json received"}), 400

    answer = data.get('answer') 
    question = data.get('question')

    explanation = generate_explanation(answer, question)

    return jsonify(explanation)


@extract_bp.route('/hint', methods=['POST'])
def hint_answer():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No json received"}), 400
    
    question = data.get('question')
    options = data.get('options')

    if not question or not options:
        return jsonify({"error": "Missing question or options"}), 400
    
    hint = generate_hint(question, options)

    return jsonify(hint)


@extract_bp.route('/topic', methods=['POST'])
def create_by_topic():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No json received"}), 400
    
    topic = data.get('topic')

    expand_prompt = f"""
    Explain the topic "{topic}" in a concise lecture format. 
    Cover general concepts, key details, and important subtopics. 
    Include examples where relevant. 
    Keep it under 200 words. 

    !IMPORTANT: Ensure the content is detailed enough to generate up to 20 flashcards and quizzes.
    Output only the content — no explanations or extra text.
    """


    expanded_topic = call_ai(expand_prompt)

    materials = generate_study_material(expanded_topic)

    return jsonify(materials)


@extract_bp.route('/convert-to-pdf', methods=['POST'])
def convert_to_pdf():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No json received"}), 400
    
    allQA = data.get('allQA', [])

    if not allQA:
        return jsonify({"error": "allQA list is empty"}), 400
    
    try:
        pdf_file = generate_pdf(allQA)

        safe_filename = "StudilyFlashcards.pdf"

        return send_file(
            pdf_file,
            as_attachment=True,
            download_name=safe_filename,
            mimetype='application/pdf'
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
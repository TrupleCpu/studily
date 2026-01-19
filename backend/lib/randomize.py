import random
from copy import deepcopy

def randomize_questions_answers(answer_response):
    randomize_questions = []
    for question in answer_response:

        question_copy = deepcopy(question)

        options = question_copy['options']
        correct_answer = options[question_copy['correctIndex']]

        random.shuffle(options)

        new_correct_index = options.index(correct_answer)

        question_copy['options'] = options
        question_copy['correctIndex'] = new_correct_index

        randomize_questions.append(question_copy)

    return randomize_questions
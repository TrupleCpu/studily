import type { DefaultQuizProps } from "../components/QuizView";

 export const shuffleQuestion = (question: DefaultQuizProps): DefaultQuizProps => {
    const options = [...question.options];
    const correctAnswer = options[question.correctIndex]

    for(let i = options.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j] = options[j], options[i]]
    }

    const newCorrectIndex = options.indexOf(correctAnswer);

    return {
      ...question,
      options,
      correctIndex: newCorrectIndex
    }
  }
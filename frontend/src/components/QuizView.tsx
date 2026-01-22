import {
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  RotateCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./Button";
import { shuffleQuestion } from "../lib/shuffleQuestion";

export type DefaultQuizProps = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
};
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const QuizView = ({ quiz }: { quiz: DefaultQuizProps[] }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);
  const [shuffledQuestion, setShuffledQuestion] = useState<DefaultQuizProps>(shuffleQuestion(quiz[0]));


  const question = quiz[currentIndex];

  useEffect(() => {
    setHint(null);
    setShuffledQuestion(quiz[currentIndex])
  }, [currentIndex]);

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === shuffledQuestion.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleGetHint = async () => {
    if (hint) return;
    setLoadingHint(true);
    try {
     const data = await fetch(`${API_BASE_URL}/api/hint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: quiz[currentIndex].question,
          options: quiz[currentIndex].options,
        }),
      });

      const res = await data.json();
      setHint(res.hint);
    } catch (err) {
      setHint("Could not load hint.");
    } finally {
      setLoadingHint(false);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setQuizFinished(false);
    setHint(null);
  };

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-md dark:shadow-none">
          <GraduationCap size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Quiz Completed!
        </h2>
        <p className="text-slate-500 dark:text-neutral-400 mb-8 text-lg">
          You scored{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {score}
          </span>{" "}
          out of {quiz.length}
        </p>
        <Button
          variant="outline"
          className="px-6 py-3 border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-neutral-50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          onClick={restartQuiz}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-300">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-neutral-400 mb-2">
          <span>
            Question {currentIndex + 1} of {quiz.length}
          </span>
          <span>Score: {score}</span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-[#2C2C2F] rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-neutral-50 leading-tight mb-4">
          {question.question}
        </h3>

        {/* AI Hint */}
        <div className="min-h-[2rem]">
          {hint ? (
            <div className="inline-flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg animate-in fade-in">
              <Lightbulb size={16} className="mt-0.5 shrink-0" />
              <span>{hint}</span>
            </div>
          ) : (
            !selectedOption && (
              <button
                onClick={handleGetHint}
                disabled={loadingHint}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-2 hover:underline disabled:opacity-50"
              >
                {loadingHint ? (
                  <RotateCw className="animate-spin" size={14} />
                ) : (
                  <Sparkles size={14} />
                )}
                {loadingHint ? "Asking AI..." : "Get a Hint"}
              </button>
            )
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          let stateStyles =
            "border-slate-200 hover:border-indigo-400 hover:bg-slate-50 dark:border-[#2C2C2F] dark:hover:bg-[#1A1A1F]";
          let icon = null;

          if (selectedOption !== null) {
            if (idx === question.correctIndex) {
              stateStyles =
                "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
              icon = <CheckCircle2 size={20} className="text-green-500" />;
            } else if (idx === selectedOption) {
              stateStyles =
                "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
              icon = <XCircle size={20} className="text-red-500" />;
            } else {
              stateStyles = "border-slate-200 opacity-50 dark:border-[#2C2C2F]";
            }
          }

          return (
            <button
              key={idx}
              disabled={selectedOption !== null}
              onClick={() => handleSelect(idx)}
              className={`
            w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-200 flex justify-between items-center
            ${stateStyles}
            ${selectedOption === null ? "dark:text-neutral-50" : ""}
          `}
            >
              <span>{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Next & Finish Button */}
      <div className="mt-8 h-14">
        {showResult && (
          <Button
            variant="primary"
            className="w-full animate-in fade-in slide-in-from-bottom-2"
            onClick={handleNext}
          >
            {currentIndex === quiz.length - 1 ? "Finish Quiz" : "Next Question"}
            <ChevronRight size={20} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizView;

import { useEffect, useState, type SetStateAction } from "react";
import {
  BrainCircuit,
  Library,
  Moon,
  Sun,
  UploadCloud,
} from "lucide-react";
import QuizView, { type DefaultQuizProps } from "./components/QuizView";
import { DEFAULT_FLASHCARDS, DEFAULT_QUIZ } from "./data/defaultDatas";
import CatIcon from "./assets/cat.png";
import UploadView, { type FlashCardProps } from "./components/UploadView";
import FlashcardView from "./components/FlashcardView";

// Toggle Component
type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

const Toggle = ({ checked, onChange }: ToggleProps) => (
  <div
    className="flex items-center gap-3 cursor-pointer select-none group"
    onClick={() => onChange(!checked)}
  >
    <span
      className={`text-sm font-medium transition-colors ${
        checked
          ? "text-neutral-400"
          : "text-indigo-600 dark:text-indigo-400 font-bold"
      }`}
    >
      Study
    </span>

    <div
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors
        ${checked ? "bg-indigo-600" : "bg-neutral-300 dark:bg-neutral-700"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </div>

    <span
      className={`text-sm font-medium transition-colors ${
        checked
          ? "text-indigo-600 dark:text-indigo-400 font-bold"
          : "text-neutral-400"
      }`}
    >
      Quiz
    </span>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState("upload");
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const [flashcards, setFlashcards] =
    useState<FlashCardProps[]>(DEFAULT_FLASHCARDS);
  const [quiz, setQuiz] = useState<DefaultQuizProps[]>(DEFAULT_QUIZ);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleGenerateData = (
    newFlashcards: SetStateAction<FlashCardProps[]>,
    newQuiz: SetStateAction<DefaultQuizProps[]>
  ) => {
    setFlashcards(newFlashcards);
    setQuiz(newQuiz);
    setHasData(true);
    setCurrentPage("flashcards");
  };

  const navItems = [
    { id: "upload", label: "Create", icon: UploadCloud },
    { id: "flashcards", label: "Flashcards", icon: Library },
    { id: "quiz", label: "Quiz", icon: BrainCircuit },
  ];

  const isQuizMode = currentPage === "quiz";

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-[#0f0f10] transition-colors">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur border-b border-slate-200 dark:border-[#27272a]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentPage("upload")}
          >
            <img src={CatIcon} className="w-8 h-8" />
            <span className="font-bold text-xl text-slate-900 dark:text-neutral-100">
              Studily
            </span>
          </div>

          <div className="hidden md:flex gap-1 bg-slate-100 dark:bg-[#1f1f23] p-1 rounded-xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                disabled={!hasData && item.id !== "upload"}
                className={`px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 transition
                  ${
                    currentPage === item.id
                      ? "bg-white dark:bg-[#18181b] text-indigo-600 dark:text-indigo-400"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1f1f23]"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="pt-24 pb-24 px-4 max-w-5xl mx-auto">
        {currentPage === "upload" && (
          <UploadView onGenerate={handleGenerateData} />
        )}

        {currentPage !== "upload" && hasData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-slate-200 dark:border-[#27272a] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                  {isQuizMode ? "Knowledge Check" : "Study Session"}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  {isQuizMode
                    ? "Test what you've learned"
                    : "Flip cards to memorize"}
                </p>
              </div>

              <Toggle
                checked={isQuizMode}
                onChange={(v) => setCurrentPage(v ? "quiz" : "flashcards")}
              />
            </div>

            {currentPage === "flashcards" && (
              <FlashcardView flashcards={flashcards} />
            )}
            {currentPage === "quiz" && <QuizView quiz={quiz} />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

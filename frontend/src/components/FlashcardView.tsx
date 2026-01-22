import { useEffect, useState } from "react";
import type { FlashCardProps } from "./UploadView";
import Button from "./Button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCw,
  Sparkles
} from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const FlashcardView = ({ flashcards }: { flashcards: FlashCardProps[] }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const card = flashcards[currentIndex];

  const allQA = flashcards.map((q: {question: string, answer: string}) => ({
    question: q.question,
    answer: q.answer
  }))


  useEffect(() => {
    // Resets state when card changes
    setIsFlipped(false);
    setExplanation(null);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => setCurrentIndex((c) => c + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setTimeout(() => setCurrentIndex((c) => c - 1), 150);
    }
  };

  const handleExplain = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (explanation) return; // Already loaded

    setLoadingExplanation(true);

    try {
      const data = await fetch(`${API_BASE_URL}/api/explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: card.question,
          answer: card.answer,
        }),
      });
      const res = await data.json();
      setExplanation(res.explanation);
    } catch (err) {
      setExplanation("Error generating explantion.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleToPdf = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/convert-to-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allQA: allQA })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('pdf')) {
      const err = await response.json();
      console.error('Server error:', err);
      alert('PDF generation failed');
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'Reviewer.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) filename = match[1];
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Download failed:', error);
    alert('Error downloading PDF');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto animate-in fade-in duration-500">
      {/* Header Controls */}
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-sm font-semibold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-[#1f1f23] px-3 py-1 rounded-full">
          Card {currentIndex + 1} / {flashcards.length}
        </span>

        <Button
          variant="ghost"
          className="text-indigo-600 dark:text-indigo-400 gap-2 h-9 px-3"
          onClick={() => handleToPdf()}
          disabled={isLoading}
       >
          <Download size={16} /> Export PDF
        </Button>
      </div>

      {/* Card Container */}
      <div
        className="w-full aspect-[4/3] md:aspect-[16/9] relative perspective-1000 group cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`
        relative w-full h-full transition-all duration-500 transform-3d
        ${isFlipped ? "rotate-y-180" : ""}
      `}
        >
          {/* Front Card */}
          <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#18181b] rounded-3xl shadow-xl border-b-4 border-slate-200 dark:border-[#27272a] p-8 flex flex-col items-center justify-center text-center backface-hidden">
            <span className="absolute top-6 left-6 text-xs font-bold tracking-wider text-slate-400 dark:text-neutral-500 uppercase">
              Question
            </span>

            <p className="text-xl md:text-3xl font-medium text-slate-800 dark:text-neutral-100 leading-relaxed">
              {card.question}
            </p>

            <span className="absolute bottom-6 text-sm text-slate-400 dark:text-neutral-500 flex items-center gap-2">
              <RotateCw size={14} /> Tap to flip
            </span>
          </div>

          {/* Back Card */}
          <div className="absolute inset-0 w-full h-full bg-indigo-600 dark:bg-[#1f2937] rounded-3xl shadow-xl border-b-4 border-indigo-800 dark:border-indigo-950 p-8 flex flex-col items-center justify-center text-center rotate-y-180 backface-hidden overflow-hidden">
            <span className="absolute top-6 left-6 text-xs font-bold tracking-wider text-indigo-200 uppercase">
              Answer
            </span>

            {/* Answer Content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <p className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-4">
                {card.answer}
              </p>

              {/* AI Explanation */}
              {explanation && (
                <div className="mt-2 p-3 bg-black/20 rounded-xl text-sm text-indigo-100 text-left w-full animate-in fade-in slide-in-from-bottom-2 backface-hidden">
                  <div className="flex items-center gap-1 mb-1 text-indigo-200 font-semibold text-xs uppercase">
                    <Sparkles size={10} /> AI Explanation
                  </div>
                  {explanation}
                </div>
              )}
            </div>

            {/* AI Button */}
            {!explanation && (
              <button
                onClick={handleExplain}
                className="absolute bottom-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-colors flex items-center gap-2 backface-hidden"
              >
                {loadingExplanation ? (
                  <LoadingSpinner />
                ) : (
                  <Sparkles size={14} />
                )}
                {loadingExplanation ? "Thinking..." : "Explain with AI"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between w-full mt-8">
        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          disabled={currentIndex === 0}
          className="w-14 h-14 rounded-full p-0"
        >
          <ChevronLeft size={24} />
        </Button>

        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          disabled={currentIndex === flashcards.length - 1}
          className="w-14 h-14 rounded-full p-0"
        >
          <ChevronRight size={24} />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardView;

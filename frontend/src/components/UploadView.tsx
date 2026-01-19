import {
  AlertCircle,
  BrainCircuit,
  FileText,
  RotateCw,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Button from "./Button";
import { useState } from "react";
import { DEFAULT_FLASHCARDS, DEFAULT_QUIZ } from "../data/defaultDatas";
import type { DefaultQuizProps } from "./QuizView";

export type FlashCardProps = {
  id: number;
  question: string;
  answer: string;
};
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const UploadView = ({
  onGenerate,
}: {
  onGenerate: (params1: FlashCardProps[], params2: DefaultQuizProps[]) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      if (file) {
        if (file?.size > MAX_FILE_SIZE) {
          setError("File size exceeds the 5MB limit.");
          setFile(null);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/api/upload-file`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("File uploade failed");
        }

        const materials = await response.json();
        console.log(materials);

        onGenerate(materials.flashcards, materials.quizcards);
        return;
      }

      if (!topic) {
        throw new Error("No topic or file provided");
      }
      const response = await fetch(
        `${API_BASE_URL}/api/topic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topic,
          }),
        }
      );

      const materialsFromTopic = await response.json();
      console.log(materialsFromTopic);
      onGenerate(
        materialsFromTopic.flashcards || DEFAULT_FLASHCARDS,
        materialsFromTopic.quizcards || DEFAULT_QUIZ
      );
    } catch (err) {
      console.error(err);
      setError("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-8 max-w-md">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 mb-3">
          Create Study Material
        </h2>
        <p className="text-slate-500 dark:text-neutral-400">
          Upload a file or enter a topic to instantly generate flashcards and
          quizzes with AI.
        </p>
      </div>

      <div className="w-full max-w-lg space-y-4">
        {/* Topic Input */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-[#27272a] focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            Enter a Topic or Paste Notes
          </label>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Photosynthesis, The French Revolution, or paste your lecture notes here..."
            className="w-full h-32 bg-slate-50 dark:bg-[#0f0f10] border-0 rounded-xl p-4 text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 resize-none focus:ring-0"
          />
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-200 dark:border-[#27272a]" />
          <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-neutral-500 text-sm">
            OR
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-[#27272a]" />
        </div>

        {/* File Upload */}
        <div
          className={`
        w-full p-8 border-2 border-dashed rounded-3xl transition-all duration-300
        flex flex-col items-center justify-center text-center cursor-pointer group
        ${
          isDragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.02]"
            : "border-slate-300 dark:border-[#27272a] hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-[#1f1f23]"
        }
      `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,,.pptx,.docx"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />

          <div
            className={`
          w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
          ${
            file
              ? "bg-indigo-100 text-indigo-600"
              : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
          }
          dark:bg-[#1f1f23] dark:text-neutral-400 dark:group-hover:bg-[#27272a]
        `}
          >
            {file ? <FileText size={24} /> : <UploadCloud size={24} />}
          </div>

          {file ? (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <p className="font-semibold text-slate-900 dark:text-neutral-100">
                {file.name}
              </p>
              <Button
                variant="ghost"
                className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-3 py-1 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div>
              <p className="font-medium text-slate-900 dark:text-neutral-100">
                Upload File
              </p>
              <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1">
                PDF, PPTX, DOCX
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <Button
          variant={topic ? "magic" : "primary"}
          className="w-full h-14 text-lg shadow-xl shadow-indigo-200 dark:shadow-none mt-4"
          disabled={(!file && !topic) || isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <RotateCw className="animate-spin" /> Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {topic ? <Sparkles size={20} /> : <BrainCircuit size={20} />}
              {topic ? "Generate with AI" : "Generate Materials"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadView;

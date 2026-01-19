import React from "react";
import type { LucideIcon } from "lucide-react";

const variants = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700",
  outline:
    "bg-transparent text-slate-600 border border-slate-300 hover:bg-slate-50 dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-800",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
  magic:
    "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40",
} as const;

type Variant = keyof typeof variants;

type ButtonProps = {
  children?: React.ReactNode;
  onClick?: (e: {stopPropagation: () => void}) => void;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  icon: Icon,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export default Button;

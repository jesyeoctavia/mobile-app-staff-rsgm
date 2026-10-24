import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface FloatingAiButtonProps {
  isLoading: boolean;
  hasReadySuggestion: boolean;
  onClick: () => void;
}

export const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({
  isLoading,
  hasReadySuggestion,
  onClick,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        aria-label="Buka Asisten AI"
        className={`group relative flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all transform active:scale-95 ${
          isLoading
            ? 'bg-indigo-100 text-indigo-700 cursor-not-allowed border border-indigo-300'
            : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-300/50'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              AI sedang menyusun...
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              ✨ Bantu AI
            </span>
          </>
        )}

        {/* Green badge indicator when suggestion is ready */}
        {!isLoading && hasReadySuggestion && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        )}
      </button>
    </div>
  );
};

import React from 'react';
import { PageGameState } from '../types';
import { Check, Layers } from 'lucide-react';

interface PageSelectorProps {
  totalPages: number;
  currentPage: number;
  pageStates: Record<number, PageGameState>;
  onSelectPage: (pageNumber: number) => void;
}

export const PageSelector: React.FC<PageSelectorProps> = ({
  totalPages,
  currentPage,
  pageStates,
  onSelectPage,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
            Páginas do Livro ({totalPages} {totalPages === 1 ? 'página' : 'páginas'})
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Selecione uma página para ler e jogar o caça-palavras
        </span>
      </div>

      {/* Sequência de quadrados em linhas e colunas numeradas */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5 max-h-40 overflow-y-auto p-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
          const isSelected = pageNum === currentPage;
          const state = pageStates[pageNum];
          const hasFoundAll =
            state &&
            state.targetWords.length > 0 &&
            state.foundWords.length >= state.targetWords.length;
          const foundCount = state?.foundWords?.length || 0;
          const totalCount = state?.targetWords?.length || 0;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onSelectPage(pageNum)}
              className={`
                relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl font-mono-grid font-bold text-sm
                flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
                border shadow-sm
                ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/80 shadow-amber-500/20 scale-105 z-10'
                    : hasFoundAll
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/40 hover:border-emerald-400'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white hover:border-slate-500'
                }
              `}
              title={`Página ${pageNum}${
                totalCount > 0 ? ` (${foundCount}/${totalCount} palavras)` : ''
              }`}
            >
              <span>{pageNum}</span>

              {/* Indicador de status no quadrado */}
              {hasFoundAll ? (
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500 text-slate-950 font-black'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              ) : foundCount > 0 ? (
                <span
                  className={`text-[9px] leading-none font-sans font-semibold mt-0.5 ${
                    isSelected ? 'text-slate-900' : 'text-amber-400'
                  }`}
                >
                  {foundCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};


import React from 'react';
import { BookPage, PageGameState } from '../types';
import { normalizeWord } from '../utils/markdownParser';
import { BookOpen, CheckCircle, Search } from 'lucide-react';

interface BookPageViewerProps {
  page: BookPage;
  totalPages: number;
  gameState: PageGameState;
}

export const BookPageViewer: React.FC<BookPageViewerProps> = ({
  page,
  totalPages,
  gameState,
}) => {
  const { targetWords, foundWords } = gameState;

  // Cria mapas de palavras-alvo para consulta rápida
  const targetSet = React.useMemo(() => new Set(targetWords), [targetWords]);
  const foundSet = React.useMemo(() => new Set(foundWords), [foundWords]);

  /**
   * Renderiza um parágrafo destacando as palavras selecionadas para o caça-palavras
   */
  const renderParagraphWithHighlights = (text: string) => {
    // Divide o texto mantendo as palavras e os separadores (espaços, pontuações)
    const tokens = text.split(/([a-zA-ZÀ-ÿ]+)/g);

    return tokens.map((token, index) => {
      const normalized = normalizeWord(token);

      if (targetSet.has(normalized)) {
        const isFound = foundSet.has(normalized);

        return (
          <mark
            key={index}
            className={`
              inline-block px-1 py-0.5 mx-0.5 rounded transition-all duration-300 font-medium
              ${
                isFound
                  ? 'bg-emerald-500/25 text-emerald-300 border-b-2 border-emerald-400 shadow-sm'
                  : 'bg-amber-400/25 text-amber-200 border-b-2 border-amber-400 shadow-sm'
              }
            `}
            title={
              isFound
                ? `"${token}" já foi encontrada no caça-palavras!`
                : `Procure por "${token}" no caça-palavras!`
            }
          >
            {token}
          </mark>
        );
      }

      // Linhas que são títulos markdown (ex: ## Capítulo)
      if (token.startsWith('#')) {
        return null;
      }

      return <span key={index}>{token}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      {/* Cabeçalho da Página */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-serif-book">
              {page.title || `Página ${page.pageNumber}`}
            </h2>
            <p className="text-xs text-slate-400">
              Página {page.pageNumber} de {totalPages}
            </p>
          </div>
        </div>

        {/* Legenda de status no texto */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400/70 border border-amber-300 inline-block" />
            <span className="text-slate-300">Para encontrar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400 inline-block" />
            <span className="text-slate-300">Encontrada</span>
          </div>
        </div>
      </div>

      {/* Conteúdo textual da página */}
      <div className="flex-1 overflow-y-auto pr-3 space-y-4 font-serif-book text-slate-200 text-base md:text-lg leading-relaxed selection:bg-amber-500/40">
        {page.paragraphs.map((paragraph, idx) => {
          // Se for título markdown
          if (paragraph.startsWith('#')) {
            const cleanTitle = paragraph.replace(/^#+\s*/, '');
            return (
              <h3
                key={idx}
                className="text-xl md:text-2xl font-bold text-amber-300 tracking-wide mt-4 mb-2 font-serif-book"
              >
                {cleanTitle}
              </h3>
            );
          }

          return (
            <p key={idx} className="indent-6 text-justify">
              {renderParagraphWithHighlights(paragraph)}
            </p>
          );
        })}
      </div>

      {/* Rodapé da Página com contadores */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-400" />
          <span>
            {targetWords.length} palavras destacadas nesta página
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>
            {foundWords.length} de {targetWords.length} achadas
          </span>
        </div>
      </div>
    </div>
  );
};


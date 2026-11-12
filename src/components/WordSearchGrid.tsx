import React from 'react';
import { CellCoord, PageGameState } from '../types';
import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WordSearchGridProps {
  gameState: PageGameState;
  onSelectionChange: (newSelection: CellCoord[]) => void;
  onWordFound: (word: string, cells: CellCoord[]) => void;
}

export const WordSearchGrid: React.FC<WordSearchGridProps> = ({
  gameState,
  onSelectionChange,
  onWordFound,
}) => {
  const { grid, targetWords, foundWords, currentSelection, placements } = gameState;

  // Monta um conjunto de células já encontradas para visualização rápida
  const foundCellsMap = React.useMemo(() => {
    const map = new Map<string, string>(); // "r,c" => word
    for (const word of foundWords) {
      const cells = placements[word] || [];
      for (const cell of cells) {
        map.set(`${cell.row},${cell.col}`, word);
      }
    }
    return map;
  }, [foundWords, placements]);

  // Mapa de células atualmente selecionadas
  const selectedCellsSet = React.useMemo(() => {
    const set = new Set<string>();
    for (const cell of currentSelection) {
      set.add(`${cell.row},${cell.col}`);
    }
    return set;
  }, [currentSelection]);

  // Letras formadas pela seleção atual
  const selectedWordString = React.useMemo(() => {
    return currentSelection.map(c => grid[c.row]?.[c.col] || '').join('');
  }, [currentSelection, grid]);

  // Efeito sonoro suave usando Web Audio API
  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext não suportado ou bloqueado
    }
  };

  // Testa se uma seleção de células forma uma das palavras-alvo não encontradas
  const checkSelection = React.useCallback(
    (selection: CellCoord[]) => {
      if (selection.length < 2) return;

      const forwardStr = selection.map(c => grid[c.row]?.[c.col] || '').join('');
      const backwardStr = [...forwardStr].reverse().join('');

      for (const target of targetWords) {
        if (foundWords.includes(target)) continue;

        if (forwardStr === target || backwardStr === target) {
          // Confere se as coordenadas são válidas e batem com o tamanho
          if (selection.length === target.length) {
            playSuccessSound();
            onWordFound(target, selection);

            // Se completou todas as palavras da página, comemora com confete!
            if (foundWords.length + 1 >= targetWords.length) {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            }
            return;
          }
        }
      }
    },
    [grid, targetWords, foundWords, onWordFound]
  );

  // Manipulador de clique na célula
  const handleCellClick = (row: number, col: number) => {
    const key = `${row},${col}`;

    // Se já está selecionada, o usuário quer desmarcá-la
    if (selectedCellsSet.has(key)) {
      const newSelection = currentSelection.filter(
        c => !(c.row === row && c.col === col)
      );
      onSelectionChange(newSelection);
      checkSelection(newSelection);
      return;
    }

    // Adiciona na sequência selecionada
    const newSelection = [...currentSelection, { row, col }];
    onSelectionChange(newSelection);
    checkSelection(newSelection);
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  const totalWords = targetWords.length;
  const foundCount = foundWords.length;
  const progressPercent = totalWords > 0 ? Math.round((foundCount / totalWords) * 100) : 0;

  return (
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Cabeçalho do Caça-Palavras com quantitativo */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Caça-Palavras da Página
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clique nas letras em sequência para formar as palavras escondidas
          </p>
        </div>

        {/* Quantitativo de palavras achadas */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Palavras Achadas
            </div>
            <div className="text-lg font-extrabold text-amber-400 flex items-center justify-end gap-1.5">
              <span>{foundCount}</span>
              <span className="text-slate-500 text-sm font-normal">/</span>
              <span className="text-slate-300 text-sm font-semibold">{totalWords}</span>
              {foundCount === totalWords && totalWords > 0 && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-1 inline animate-bounce" />
              )}
            </div>
          </div>

          {currentSelection.length > 0 && (
            <button
              onClick={handleClearSelection}
              title="Limpar seleção atual"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-slate-700/60"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-4 border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Indicador da palavra sendo digitada/selecionada */}
      <div className="h-9 mb-3 px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">Seleção atual:</span>
        <span className="font-mono-grid tracking-widest text-sm font-bold text-amber-300">
          {selectedWordString || <span className="text-slate-600 text-xs tracking-normal font-sans italic">Nenhuma letra marcada</span>}
        </span>
        {currentSelection.length > 0 && (
          <span className="text-[11px] text-slate-500">
            {currentSelection.length} {currentSelection.length === 1 ? 'letra' : 'letras'}
          </span>
        )}
      </div>

      {/* Grade de Letras */}
      <div className="flex justify-center items-center overflow-x-auto py-2">
        <div
          className="grid gap-1 sm:gap-1.5 select-none p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, rIdx) =>
            row.map((letter, cIdx) => {
              const cellKey = `${rIdx},${cIdx}`;
              const isFound = foundCellsMap.has(cellKey);
              const isSelected = selectedCellsSet.has(cellKey);

              let cellStyle =
                'bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800/70';

              if (isFound && isSelected) {
                cellStyle =
                  'bg-emerald-500/40 text-emerald-200 border-amber-400/80 ring-2 ring-amber-400/60 font-black';
              } else if (isFound) {
                cellStyle =
                  'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 font-bold';
              } else if (isSelected) {
                cellStyle =
                  'bg-amber-500 text-slate-950 border-amber-300 font-extrabold ring-2 ring-amber-400/70 shadow-lg shadow-amber-500/30 scale-105';
              }

              return (
                <button
                  key={cellKey}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  type="button"
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center
                    rounded-lg font-mono-grid text-sm sm:text-base font-semibold
                    transition-all duration-150 border cursor-pointer
                    ${cellStyle}
                  `}
                  title={`Linha ${rIdx + 1}, Coluna ${cIdx + 1}: ${letter}`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Lista de Palavras-alvo com status */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Palavras escondidas nesta página ({targetWords.length})
          </span>
          <span className="text-xs text-slate-500">
            Normais e invertidas (Horiz., Vert., Diag.)
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          {targetWords.map(word => {
            const isFound = foundWords.includes(word);
            return (
              <span
                key={word}
                className={`
                  px-2.5 py-1 rounded-md text-xs font-mono-grid font-medium transition-colors
                  ${
                    isFound
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 line-through opacity-80'
                      : 'bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:border-slate-500'
                  }
                `}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};


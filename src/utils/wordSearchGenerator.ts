import { CellCoord, Direction, PageGameState } from '../types';
import { extractEligibleWords } from './markdownParser';

// 8 Direções: Horizontal, Vertical e Diagonais (Normais e Invertidas)
const ALL_DIRECTIONS: Direction[] = [
  [0, 1],   // Horizontal normal (esquerda -> direita)
  [0, -1],  // Horizontal invertida (direita -> esquerda)
  [1, 0],   // Vertical normal (cima -> baixo)
  [-1, 0],  // Vertical invertida (baixo -> cima)
  [1, 1],   // Diagonal descendente direita
  [-1, -1], // Diagonal ascendente esquerda (invertida)
  [1, -1],  // Diagonal descendente esquerda
  [-1, 1],  // Diagonal ascendente direita (invertida)
];

// Frequência de letras em língua portuguesa para preenchimento natural do grid
const PORTUGUESE_LETTER_POOL = 'AAAAAAEEEEIIIINNNNOOOORRRRSSSSTTTUUUUBBCDFGHJLMPQVXZ';

function getRandomLetter(): string {
  const index = Math.floor(Math.random() * PORTUGUESE_LETTER_POOL.length);
  return PORTUGUESE_LETTER_POOL[index];
}

/**
 * Embaralha um array
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Cria o estado do caça-palavras para uma página específica
 */
export function createPageGameState(
  pageNumber: number,
  pageMarkdown: string,
  gridSize = 17
): PageGameState {
  const eligible = extractEligibleWords(pageMarkdown);

  // Embaralha e seleciona até 20 palavras únicas com mais de 4 caracteres
  const shuffled = shuffleArray(eligible);
  const selectedEntries = shuffled.slice(0, Math.min(20, shuffled.length));

  const targetWords: string[] = [];
  const wordDisplayMap: Record<string, string> = {};

  for (const entry of selectedEntries) {
    targetWords.push(entry.normalized);
    wordDisplayMap[entry.normalized] = entry.original;
  }

  // Ordena as palavras da mais longa para a mais curta para maximizar sucesso do posicionamento
  const wordsToPlace = [...targetWords].sort((a, b) => b.length - a.length);

  // Inicializa matriz vazia
  let grid: string[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill('')
  );
  const placements: Record<string, CellCoord[]> = {};

  // Tenta posicionar cada palavra
  for (const word of wordsToPlace) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 300;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      const dir = ALL_DIRECTIONS[Math.floor(Math.random() * ALL_DIRECTIONS.length)];
      const [dRow, dCol] = dir;

      // Calcula limites válidos para o ponto inicial
      const minRow = dRow < 0 ? word.length - 1 : 0;
      const maxRow = dRow > 0 ? gridSize - word.length : gridSize - 1;

      const minCol = dCol < 0 ? word.length - 1 : 0;
      const maxCol = dCol > 0 ? gridSize - word.length : gridSize - 1;

      if (minRow > maxRow || minCol > maxCol) continue;

      const startRow = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
      const startCol = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;

      // Verifica se a palavra cabe sem conflito
      let canPlace = true;
      const coords: CellCoord[] = [];

      for (let i = 0; i < word.length; i++) {
        const r = startRow + i * dRow;
        const c = startCol + i * dCol;
        const existing = grid[r][c];

        if (existing !== '' && existing !== word[i]) {
          canPlace = false;
          break;
        }
        coords.push({ row: r, col: c });
      }

      if (canPlace) {
        // Grava na matriz
        for (let i = 0; i < word.length; i++) {
          const { row, col } = coords[i];
          grid[row][col] = word[i];
        }
        placements[word] = coords;
        placed = true;
      }
    }

    // Se por acaso a palavra não coube (muito raro em grid 17x17), não trava o app
    if (!placed) {
      console.warn(`Palavra ${word} não pôde ser posicionada no grid`);
    }
  }

  // Preenche células vazias com letras aleatórias
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = getRandomLetter();
      }
    }
  }

  return {
    pageNumber,
    targetWords: targetWords.filter(w => !!placements[w]), // apenas as colocadas com sucesso
    wordDisplayMap,
    grid,
    placements,
    foundWords: [],
    currentSelection: []
  };
}


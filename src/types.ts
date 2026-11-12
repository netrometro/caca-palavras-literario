export interface BookPage {
  pageNumber: number; // 1-indexed
  title?: string;
  markdown: string;
  paragraphs: string[];
}

export type Direction = [number, number]; // [deltaRow, deltaCol]

export interface CellCoord {
  row: number;
  col: number;
}

export interface WordPlacement {
  word: string; // Normalizada (maiúscula, sem acento)
  originalWord: string; // Palavra como aparece no texto
  cells: CellCoord[];
}

export interface PageGameState {
  pageNumber: number;
  // Lista de 20 palavras únicas selecionadas da página (normalizadas)
  targetWords: string[];
  // Mapa de palavra normalizada para a forma original encontrada no texto
  wordDisplayMap: Record<string, string>;
  // Grade de letras do caça-palavras (ex: 16x16)
  grid: string[][];
  // Posições de cada palavra colocada no grid
  placements: Record<string, CellCoord[]>;
  // Lista de palavras que já foram encontradas
  foundWords: string[];
  // Células atualmente clicadas/selecionadas pelo usuário
  currentSelection: CellCoord[];
}


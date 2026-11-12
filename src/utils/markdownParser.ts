import { BookPage } from '../types';

/**
 * Remove acentos e caracteres especiais para normalização das palavras do caça-palavras
 */
export function normalizeWord(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

/**
 * Extrai palavras válidas (apenas letras, tamanho > 4 caracteres) de um texto
 */
export function extractEligibleWords(text: string): { normalized: string; original: string }[] {
  // Ignora marcadores de título do markdown para contagem de palavras do texto
  const cleanText = text.replace(/^#+\s+/gm, '');
  const wordRegex = /[a-zA-ZÀ-ÿ]+/g;
  const matches = cleanText.match(wordRegex) || [];
  
  const seen = new Set<string>();
  const result: { normalized: string; original: string }[] = [];

  for (const m of matches) {
    const norm = normalizeWord(m);
    // Palavras com mais de 4 caracteres (> 4 letras)
    if (norm.length > 4 && !seen.has(norm)) {
      seen.add(norm);
      result.push({
        normalized: norm,
        original: m
      });
    }
  }

  return result;
}

/**
 * Divide o conteúdo markdown do livro em páginas bem dimensionadas,
 * garantindo que toda página tenha um conteúdo substancial e no mínimo 25+ palavras elegíveis (>4 caracteres)
 * para alimentar confortavelmente as 20 palavras do caça-palavras.
 */
export function splitMarkdownIntoPages(markdown: string): BookPage[] {
  const cleanMarkdown = markdown.trim();
  if (!cleanMarkdown) {
    return [
      {
        pageNumber: 1,
        title: 'Página 1',
        markdown: 'Nenhum texto carregado.',
        paragraphs: ['Nenhum texto carregado.']
      }
    ];
  }

  // Divide o documento em parágrafos preservando quebras
  const rawParagraphs = cleanMarkdown
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !/^---+$/.test(p));

  const pagesText: string[] = [];
  let currentParagraphs: string[] = [];

  // Mínimo recomendado de palavras elegíveis (>4 letras) por página para ter riqueza no caça-palavras
  const MIN_ELIGIBLE_WORDS = 28;
  const TARGET_TOTAL_WORDS = 200;

  for (const para of rawParagraphs) {
    currentParagraphs.push(para);
    const joinedText = currentParagraphs.join('\n\n');
    const eligible = extractEligibleWords(joinedText);
    const totalWords = joinedText.split(/\s+/).length;

    // Se já acumulou palavras suficientes e conteúdo substancial, fecha a página
    if (eligible.length >= MIN_ELIGIBLE_WORDS && totalWords >= TARGET_TOTAL_WORDS) {
      pagesText.push(joinedText);
      currentParagraphs = [];
    }
  }

  // Se sobrou algum bloco
  if (currentParagraphs.length > 0) {
    const remainingText = currentParagraphs.join('\n\n');
    const eligibleRemaining = extractEligibleWords(remainingText);

    // Se o restante for muito curto ou tiver menos de 20 palavras, anexa à página anterior se houver
    if (pagesText.length > 0 && eligibleRemaining.length < 22) {
      pagesText[pagesText.length - 1] += '\n\n' + remainingText;
    } else {
      pagesText.push(remainingText);
    }
  }

  // Caso todo o texto tenha gerado menos de 1 página (ex: texto curto)
  if (pagesText.length === 0) {
    pagesText.push(cleanMarkdown);
  }

  return pagesText.map((content, idx) => {
    // Tenta encontrar o título principal ou capítulo presente na página
    const headerMatch = content.match(/^#{1,3}\s+(.+)$/m);
    const title = headerMatch ? headerMatch[1].replace(/[*_~`]/g, '') : `Página ${idx + 1}`;

    const paragraphs = content
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0 && !/^---+$/.test(p));

    return {
      pageNumber: idx + 1,
      title,
      markdown: content,
      paragraphs
    };
  });
}

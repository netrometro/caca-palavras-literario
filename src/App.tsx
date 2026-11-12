import React, { useState, useEffect, useMemo, useRef } from 'react';
import { sampleBookMarkdown } from './data/sampleBook';
import { splitMarkdownIntoPages } from './utils/markdownParser';
import { createPageGameState } from './utils/wordSearchGenerator';
import { BookPage, CellCoord, PageGameState } from './types';
import { PageSelector } from './components/PageSelector';
import { BookPageViewer } from './components/BookPageViewer';
import { WordSearchGrid } from './components/WordSearchGrid';
import { BookOpenText, UploadCloud, RefreshCw, FileText, Award } from 'lucide-react';

export const App: React.FC = () => {
  // Estado do livro carregado
  const [markdownContent, setMarkdownContent] = useState<string>(sampleBookMarkdown);
  const [fileName, setFileName] = useState<string>('O Alienista - Machado de Assis (Exemplo)');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados dos caça-palavras de cada página (armazenado em memória)
  // "a aplicação não esquece o estado do caça palavras quando outra página é trocada."
  const [pageStates, setPageStates] = useState<Record<number, PageGameState>>({});

  // Divide o markdown nas páginas do livro
  const pages: BookPage[] = useMemo(() => {
    return splitMarkdownIntoPages(markdownContent);
  }, [markdownContent]);

  // Garante que a página atual exista quando o número de páginas mudar
  useEffect(() => {
    if (currentPage > pages.length) {
      setCurrentPage(1);
    }
  }, [pages.length, currentPage]);

  // Inicializa o jogo da página atual se ainda não existir no histórico
  useEffect(() => {
    if (pages.length === 0) return;
    const pageObj = pages[currentPage - 1];
    if (!pageObj) return;

    setPageStates(prev => {
      if (prev[currentPage]) {
        return prev; // Já existe no histórico da sessão
      }
      const newState = createPageGameState(currentPage, pageObj.markdown);
      return {
        ...prev,
        [currentPage]: newState,
      };
    });
  }, [currentPage, pages]);

  // Estado da página atual
  const currentGameState = pageStates[currentPage];
  const currentPageObj = pages[currentPage - 1];

  // Manipulador de upload de arquivo Markdown
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      if (text && text.trim().length > 0) {
        setMarkdownContent(text);
        setFileName(file.name);
        setCurrentPage(1);
        setPageStates({}); // Reinicia os jogos para o novo livro
      } else {
        alert('O arquivo selecionado está vazio.');
      }
    };
    reader.readAsText(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleResetToSample = () => {
    setMarkdownContent(sampleBookMarkdown);
    setFileName('O Alienista - Machado de Assis (Exemplo)');
    setCurrentPage(1);
    setPageStates({});
  };

  // Atualização da seleção no caça-palavras
  const handleSelectionChange = (newSelection: CellCoord[]) => {
    if (!currentGameState) return;
    setPageStates(prev => ({
      ...prev,
      [currentPage]: {
        ...currentGameState,
        currentSelection: newSelection,
      },
    }));
  };

  // Manipulador de palavra encontrada
  const handleWordFound = (word: string, _cells: CellCoord[]) => {
    if (!currentGameState) return;
    if (currentGameState.foundWords.includes(word)) return;

    setPageStates(prev => ({
      ...prev,
      [currentPage]: {
        ...currentGameState,
        foundWords: [...currentGameState.foundWords, word],
        currentSelection: [], // Limpa seleção após achar com sucesso
      },
    }));
  };

  // Estatísticas globais do livro
  const totalFoundInBook = Object.values(pageStates).reduce(
    (acc, st) => acc + (st.foundWords?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra de Título Superior */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <BookOpenText className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-title text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                Caça-Palavras Literário
              </h1>
              <p className="text-xs text-slate-400">
                Leia seu livro e desvende as palavras escondidas em cada página
              </p>
            </div>
          </div>

          {/* Troféu / Estatísticas Globais da Sessão */}
          {totalFoundInBook > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 self-start md:self-auto text-xs sm:text-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>
                Total de palavras achadas no livro: <strong className="text-amber-200">{totalFoundInBook}</strong>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Campo logo abaixo para ler um arquivo markdown */}
        <section
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="bg-slate-900/40 border border-dashed border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 mb-6 transition-colors shadow-inner"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-slate-800/80 text-amber-400 border border-slate-700/60">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Livro Carregado:
                  </span>
                  <span className="text-sm font-semibold text-white bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                    {fileName}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Arraste outro arquivo Markdown (.md) aqui ou use o botão ao lado para carregar qualquer livro.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleInputChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                Carregar Markdown (.md)
              </button>

              <button
                type="button"
                onClick={handleResetToSample}
                title="Recarregar o livro de exemplo (Machado de Assis)"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exemplo Padrão</span>
              </button>
            </div>
          </div>
        </section>

        {/* Sequência de quadrados em linhas e colunas numeradas representando as páginas */}
        <PageSelector
          totalPages={pages.length}
          currentPage={currentPage}
          pageStates={pageStates}
          onSelectPage={setCurrentPage}
        />

        {/* As duas colunas abaixo das páginas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[580px]">
          {/* Coluna da Esquerda: Texto da página selecionada com palavras destacadas */}
          <div className="lg:col-span-6 flex flex-col min-h-[500px]">
            {currentPageObj && currentGameState ? (
              <BookPageViewer
                page={currentPageObj}
                totalPages={pages.length}
                gameState={currentGameState}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500">
                Carregando texto da página...
              </div>
            )}
          </div>

          {/* Coluna da Direita: Caça-palavras e quantitativo */}
          <div className="lg:col-span-6 flex flex-col min-h-[500px]">
            {currentGameState ? (
              <WordSearchGrid
                gameState={currentGameState}
                onSelectionChange={handleSelectionChange}
                onWordFound={handleWordFound}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500">
                Gerando caça-palavras da página...
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Rodapé informativo */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        Caça-Palavras Literário &bull; Hospedável no GitHub Pages &bull; Processamento 100% no navegador (sem banco de dados)
      </footer>
    </div>
  );
};

export default App;


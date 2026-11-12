# Caça-Palavras Literário 📚🔍

Uma aplicação interativa em **React + TypeScript + Vite + Tailwind CSS**, concebida para leitura imersiva e jogos de caça-palavras a partir de qualquer livro em formato Markdown (`.md`), pronta para ser hospedada gratuitamente no **GitHub Pages**.

---

## 🌟 Funcionalidades

1. **Leitura e Divisão Automática de Livros em Páginas**:
   - Lê arquivos Markdown (`.md`, `.markdown` ou `.txt`) arrastados ou selecionados pelo usuário.
   - Inclui um livro de exemplo pré-carregado na inicialização (*"O Alienista"* de Machado de Assis).
   - Divide o texto dinamicamente em páginas proporcionais.

2. **Navegador de Páginas em Grade**:
   - Cada página do livro é representada por um quadrado numerado.
   - O quadrado da página atual fica destacado.
   - Exibe o progresso de palavras encontradas em cada página.

3. **Duas Colunas Interativas**:
   - **Coluna da Esquerda (Texto do Livro)**:
     - Apresenta o texto da página com tipografia confortável de livro.
     - Destaca aleatoriamente **20 palavras únicas com mais de 4 caracteres** para o usuário procurar.
     - **Mudança de cor em tempo real**: quando a palavra é encontrada no caça-palavras, o destaque no texto muda imediatamente (de âmbar para verde esmeralda).
   - **Coluna da Direita (Caça-Palavras)**:
     - Grade de letras gerada para a página contendo as 20 palavras escondidas.
     - Suporta palavras nas direções:
       - **Horizontal** (normal e invertida / direita para esquerda);
       - **Vertical** (normal e invertida / de baixo para cima);
       - **Diagonal** (descendente e ascendente, normais e invertidas).
     - **Interação**: clique nas letras em sequência para destacar e formar palavras, ou clique em uma letra destacada para desmarcá-la.
     - **Contador no topo**: exibe o quantitativo de palavras achadas (ex: `12 / 20`), barra de progresso e lista de palavras com efeitos visuais e sonoros suaves.

4. **Persistência em Memória da Sessão**:
   - **Não esquece o progresso ao trocar de página**: você pode navegar livremente entre as páginas; todas as palavras já encontradas em páginas anteriores continuam registradas.
   - Sem banco de dados ou backend: o estado reinicia completamente se a página for recarregada (F5).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js instalado (v18 ou superior).

### Passos:
1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o link exibido no terminal (normalmente `http://localhost:5173`).

---

## 🌐 Como Hospedar no GitHub Pages

Este projeto já vem configurado com:
- Caminhos de assets relativos (`base: './'`) no `vite.config.ts`.
- Workflow automatizado do GitHub Actions em `.github/workflows/deploy.yml`.

### Publicação em 3 passos:
1. Crie um repositório no GitHub e envie o código:
   ```bash
   git init
   git add .
   git commit -m "feat: caca-palavras literario"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

2. No repositório no GitHub, vá em **Settings** > **Pages**.
3. Em **Build and deployment** > **Source**, selecione **GitHub Actions**.

Assim que o push for concluído, o GitHub Actions construirá o projeto e o site estará no ar no link:
`https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`


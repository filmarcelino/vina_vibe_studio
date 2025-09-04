Objetivo geral: 
1) Corrigir tipos/paths/configs do monorepo para compilar sem erros (Node types, tsconfig, imports de packages). 
2) Unificar a experiência do Studio numa tela “Lovable-like”:
   - Página única “Playground” com três áreas: 
     (L) Sidebar (Chat / Ações), 
     (C) Preview em iframe com overlay de seleção, 
     (R) Inspector (alternável: Selection/Properties ou Monaco Editor).
   - Toolbar inferior com botões: [Edit] [Chat] [Assets] [Device: Desktop/Mobile] [Reload] [Open].
3) Manter Assets funcionando (upload/list/apply por replace simples) e RAG via proxy.
4) Evitar dependências nativas (NÃO usar sharp; se existir, remover). 
5) Nada de AST por enquanto (stub no diff-patcher).

------------------------------------------
BLOCO A — Correções de build/TS/workspace
------------------------------------------
1) Na raiz do repo, workspace-wide devDeps:
   - Adicionar @types/node como devDependency no workspace root.

2) Padronizar nomes dos packages e imports:
   Em cada packages/*/package.json:
     {
       "name": "@vina/<nome-do-pacote>",
       "version": "0.0.1",
       "type": "module",
       "main": "src/index.ts",
       "types": "src/index.ts",
       "private": true
     }
   Pacotes existentes: @vina/diff-patcher, @vina/overlay-mapper, @vina/data-adapters, @vina/design-tokens.
   Ajustar todos os imports no Studio/Runner para usar @vina/... (NÃO usar @packages/...).

3) Next transpile:
   Em apps/studio/next.config.ts:
     const nextConfig = {
       transpilePackages: [
         '@vina/diff-patcher',
         '@vina/overlay-mapper',
         '@vina/data-adapters',
         '@vina/design-tokens'
       ]
     };
     export default nextConfig;

4) tsconfig do Runner (apps/preview-runner/tsconfig.json):
   {
     "compilerOptions": {
       "lib": ["ES2022", "DOM"],
       "module": "ESNext",
       "moduleResolution": "Bundler",
       "jsx": "react-jsx",
       "target": "ES2022",
       "strict": true,
       "types": ["node", "vite/client"],
       "baseUrl": ".",
       "allowJs": true,
       "skipLibCheck": true
     },
     "include": ["src", "server", "vite.config.ts", "index.html"],
     "exclude": ["node_modules", "dist"]
   }
   Se existir tsconfig.node.json referenciado e sem include, corrigir include ou remover a referência.

5) tsconfig dos packages (ex.: packages/design-tokens/tsconfig.json):
   {
     "compilerOptions": {
       "lib": ["ES2022"],
       "module": "ESNext",
       "moduleResolution": "Bundler",
       "target": "ES2022",
       "strict": true,
       "types": ["node"],
       "skipLibCheck": true,
       "declaration": false
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist"]
   }

6) Zustand sem devtools (evitar type clash):
   apps/studio/src/stores/selection-store.ts:
     - Remover devtools; implementar:
       import { create } from 'zustand';
       type SelectionState = { file: string|null; line?: number; col?: number; componentName?: string;
                               targetAttr?: string; setSelection: (s: Partial<SelectionState>)=>void; clear: ()=>void };
       export const useSelectionStore = create<SelectionState>((set)=>({
         file: null, setSelection: (s)=>set(st=>({...st, ...s})),
         clear: ()=>set({ file:null, line:undefined, col:undefined, componentName:undefined, targetAttr: undefined })
       }));

7) packages/design-tokens: corrigir tipos da tipografia:
   export type FontStep = { fontSize: string; lineHeight: string };
   export type FontScale = Record<'xs'|'sm'|'base'|'lg'|'xl', FontStep>;
   export const textScale: FontScale = {
     xs:{fontSize:'0.75rem',lineHeight:'1rem'},
     sm:{fontSize:'0.875rem',lineHeight:'1.25rem'},
     base:{fontSize:'1rem',lineHeight:'1.5rem'},
     lg:{fontSize:'1.125rem',lineHeight:'1.75rem'},
     xl:{fontSize:'1.25rem',lineHeight:'1.75rem'}
   };
   Adaptar o preset Tailwind para aceitar {fontSize,lineHeight}, não string.

8) packages/diff-patcher: stubs (sem AST ainda):
   export async function replaceTextInComponent(){ throw new Error('AST disabled'); }
   export async function replaceImageSourceInComponent(){ throw new Error('AST disabled'); }

9) Remover qualquer uso de Buffer do client; se necessário, usar Uint8Array/ArrayBuffer.

------------------------------------------
BLOCO B — RAG Proxy e ENV
------------------------------------------
1) apps/studio/app/api/rag/route.ts (substituir pela versão robusta):
   - runtime nodejs; tenta POST /search {q}, POST /search {query}, GET /search?q=, GET /search?query=; normaliza para {ok:true, answers:string[]}.
   - Em caso de erro, {ok:false,error} com status 502.
   - Lê RAG_SERVER_URL de process.env (server-side).

2) apps/studio/.env.example:
   RAG_SERVER_URL=http://localhost:8888
   RUNNER_PROJECT_ROOT=
   ASSETS_PUBLIC_SUBDIR=public/assets

------------------------------------------
BLOCO C — Assets (upload/list/apply simples e estáveis)
------------------------------------------
1) Em todas as rotas de API de assets (upload, list, apply):
   export const runtime = 'nodejs';
   export const dynamic = 'force-dynamic';

2) /api/assets/upload (multipart):
   - Salva o arquivo em `${RUNNER_PROJECT_ROOT}/${ASSETS_PUBLIC_SUBDIR}` (mkdir recursive).
   - Sanitize do nome (kebab-case).
   - Retorna { ok:true, asset:{ url:'/assets/<nome>', kind:'image'|'svg', alt?:string } }.
   - NÃO usar sharp/svgo por enquanto.

3) /api/assets/list:
   - Lista extensões [.png,.jpg,.jpeg,.webp,.svg,.gif]; retorna { ok:true, items:[{url,kind}] }.

4) /api/assets/apply:
   - Body: { file:string, componentName?:string, targetAttr?:string, asset:{url,kind,alt?} }.
   - Lê o conteúdo do arquivo alvo dentro do RUNNER_PROJECT_ROOT.
   - Replace simples (regex seguro):
       - Se targetAttr informado, substituir primeiro `${targetAttr}="..."`
       - Caso contrário, substituir primeiro `src="..."`
       - Se houver `alt="..."`, atualizar; senão, inserir ` alt="<alt>"` antes do '>'.
   - POST no runner http://localhost:5173/api/update com { filePath:file, content:novaString }.
   - Retornar { ok:true }.

------------------------------------------
BLOCO D — UX estilo Lovable (única página Playground)
------------------------------------------
1) Unificar o fluxo na página apps/studio/app/playground/page.tsx:
   - Layout em 3 regiões:
     (L) Sidebar: 
         - Chat com duas abas: [Plan] [Quick changes].
         - Campo “Perguntar ao RAG” que chama /api/rag e mostra as 3 primeiras respostas.
     (C) PreviewPanel:
         - iframe consumindo o runner (já existente).
         - Overlay de seleção: script no runner envia postMessage {type:'preview:elementClick', domPath}. 
           O Studio, ao receber, resolve via @vina/overlay-mapper.locateComponentByDomPath(domPath) (stub) e salva na SelectionStore.
         - Highlight visual no elemento selecionado (outline CSS no overlay).
     (R) Inspector:
         - Tabs: [Selection] [Editor]
           - Selection: mostra file, componentName, line/col, e botões:
             (1) Editar Texto (desabilitado por enquanto; mostra toast “AST em breve”)
             (2) Trocar Imagem → abre drawer com Assets e chama /api/assets/apply usando Selection atual.
           - Editor: Monaco abrindo o arquivo apontado na Selection (read-only por padrão no MVP).

2) Toolbar inferior fixa (bottom bar):
   - Botões: [Edit] [Chat] [Assets] [Device: Desktop/Mobile] [Reload] [Open].
   - “Edit” ativa highlight/overlay de seleção no Preview.
   - “Chat” foca a aba Plan da Sidebar.
   - “Assets” abre a página Assets em drawer/modal (não navegação completa).
   - “Device” altera largura do iframe (ex.: 390px mobile / 1024px desktop).
   - “Reload” força reload do iframe.
   - “Open” abre o preview do runner em nova aba.

3) Assets dentro do fluxo:
   - A página /assets continua existindo, mas também oferecer um Drawer rápido na própria Playground para aplicar a imagem selecionada com um clique.

------------------------------------------
BLOCO E — Aceite (deve passar)
------------------------------------------
- `pnpm i && pnpm dev` compila sem erros TS.
- Studio em :3000 abre a página Playground com Chat (L), Preview com overlay (C) e Inspector (R).
- Clicar em qualquer elemento do preview popula a Selection (mesmo que via stub).
- “Assets”:
  - Upload → arquivo salvo em `${RUNNER_PROJECT_ROOT}/${ASSETS_PUBLIC_SUBDIR}`.
  - List → itens aparecem com miniaturas.
  - Aplicar no Preview → faz replace simples no arquivo indicado pela Selection e chama runner `/api/update`; HMR atualiza o preview.
- RAG:
  - Chat → POST /api/rag → respostas aparecem (usa RAG_SERVER_URL).

------------------------------------------
BLOCO F — Restrições/estilo
------------------------------------------
- Nada de dependência nativa (sharp) por agora; se existir, remover.
- Evitar devtools do zustand.
- Manter código modular e pequeno; sem chaves reais; .env.example atualizado.
- Commits pequenos e mensagens claras.

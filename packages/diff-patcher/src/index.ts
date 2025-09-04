import { Project, SyntaxKind, Node } from 'ts-morph';
import * as path from 'path';

export interface ReplaceTextParams {
  projectRoot: string;          // caminho do projeto que o runner serve
  filePath: string;             // ex.: 'src/App.tsx'
  componentName: string;        // ex.: 'App' ou 'Hero'
  newText: string;
}

export interface ReplaceTextResult {
  updatedContent: string;
}

export async function replaceTextInComponent(params: ReplaceTextParams): Promise<ReplaceTextResult> {
  const { projectRoot, filePath, componentName, newText } = params;
  
  try {
    // Criar projeto ts-morph
    const project = new Project({
      useInMemoryFileSystem: true,
    });
    
    // Caminho completo do arquivo
    const fullFilePath = path.join(projectRoot, filePath);
    
    // Adicionar arquivo ao projeto
    const sourceFile = project.addSourceFileAtPath(fullFilePath);
    
    if (!sourceFile) {
      throw new Error(`Arquivo não encontrado: ${fullFilePath}`);
    }
    
    // Procurar pelo componente (função ou arrow function)
    let componentNode: Node | undefined;
    
    // Procurar por function declaration
    const functionDeclaration = sourceFile.getFunction(componentName);
    if (functionDeclaration) {
      componentNode = functionDeclaration;
    }
    
    // Se não encontrou, procurar por variable declaration com arrow function
    if (!componentNode) {
      const variableDeclarations = sourceFile.getVariableDeclarations();
      for (const varDecl of variableDeclarations) {
        if (varDecl.getName() === componentName) {
          const initializer = varDecl.getInitializer();
          if (initializer && Node.isArrowFunction(initializer)) {
            componentNode = initializer;
            break;
          }
        }
      }
    }
    
    // Se não encontrou, procurar por export default
    if (!componentNode && componentName === 'default') {
      const exportAssignments = sourceFile.getExportAssignments();
      for (const exportAssignment of exportAssignments) {
        const expression = exportAssignment.getExpression();
        if (Node.isArrowFunction(expression) || Node.isFunctionExpression(expression)) {
          componentNode = expression;
          break;
        }
      }
    }
    
    if (!componentNode) {
      throw new Error(`Componente '${componentName}' não encontrado no arquivo ${filePath}`);
    }
    
    // Procurar pelo primeiro JSXElement dentro do componente
    const jsxElements = componentNode.getDescendantsOfKind(SyntaxKind.JsxElement);
    const jsxSelfClosingElements = componentNode.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    const jsxFragments = componentNode.getDescendantsOfKind(SyntaxKind.JsxFragment);
    
    const allJsxNodes = [...jsxElements, ...jsxSelfClosingElements, ...jsxFragments];
    
    if (allJsxNodes.length === 0) {
      throw new Error(`Nenhum elemento JSX encontrado no componente '${componentName}'`);
    }
    
    // Procurar pelo primeiro JSXText dentro do primeiro JSXElement
    let textNodeFound = false;
    
    for (const jsxNode of allJsxNodes) {
      const jsxTexts = jsxNode.getDescendantsOfKind(SyntaxKind.JsxText);
      
      if (jsxTexts.length > 0) {
        // Substituir o primeiro JSXText encontrado
        const firstTextNode = jsxTexts[0];
        firstTextNode.replaceWithText(newText);
        textNodeFound = true;
        break;
      }
    }
    
    if (!textNodeFound) {
      throw new Error(`Nenhum texto JSX encontrado no componente '${componentName}' para substituir`);
    }
    
    // Retornar o conteúdo atualizado
    const updatedContent = sourceFile.getFullText();
    
    return {
      updatedContent
    };
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao processar AST: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao processar AST');
  }
}
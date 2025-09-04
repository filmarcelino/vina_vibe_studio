import { create } from 'zustand';

export interface ElementSelection {
  file: string;
  line: number;
  col: number;
  componentName: string;
  targetAttr?: string;
  domPath?: string;
  elementType?: string;
  timestamp: number;
}

interface SelectionState {
  selection: ElementSelection | null;
  isSelectionMode: boolean;
  
  // Actions
  setSelection: (selection: ElementSelection | null) => void;
  clearSelection: () => void;
  toggleSelectionMode: () => void;
  setSelectionMode: (enabled: boolean) => void;
  
  // Getters
  hasSelection: () => boolean;
  getSelectionInfo: () => ElementSelection | null;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selection: null,
  isSelectionMode: false,
  
  setSelection: (selection) => {
    set({ 
      selection: selection ? {
        ...selection,
        timestamp: Date.now()
      } : null 
    });
  },
  
  clearSelection: () => {
    set({ selection: null });
  },
  
  toggleSelectionMode: () => {
    set((state) => ({ 
      isSelectionMode: !state.isSelectionMode,
      // Limpar seleção ao desabilitar modo de seleção
      selection: !state.isSelectionMode ? state.selection : null
    }));
  },
  
  setSelectionMode: (enabled) => {
    set({ 
      isSelectionMode: enabled,
      // Limpar seleção ao desabilitar modo de seleção
      selection: enabled ? get().selection : null
    });
  },
  
  hasSelection: () => {
    return get().selection !== null;
  },
  
  getSelectionInfo: () => {
    return get().selection;
  }
}));

// Hook para facilitar o uso
export const useSelection = () => {
  const store = useSelectionStore();
  
  return {
    selection: store.selection,
    isSelectionMode: store.isSelectionMode,
    hasSelection: store.hasSelection(),
    setSelection: store.setSelection,
    clearSelection: store.clearSelection,
    toggleSelectionMode: store.toggleSelectionMode,
    setSelectionMode: store.setSelectionMode,
    getSelectionInfo: store.getSelectionInfo
  };
};

// Utilitários para trabalhar com seleções
export const selectionUtils = {
  // Criar uma seleção a partir de dados do DOM
  createSelectionFromDom: (domElement: Element, componentInfo: { file: string; componentName: string; line?: number; col?: number }): ElementSelection => {
    const domPath = getDomPath(domElement);
    const elementType = domElement.tagName.toLowerCase();
    
    // Detectar possível atributo alvo baseado no tipo de elemento
    let targetAttr: string | undefined;
    if (elementType === 'img') {
      targetAttr = 'src';
    } else if (domElement.hasAttribute('src')) {
      targetAttr = 'src';
    } else if (domElement.hasAttribute('href')) {
      targetAttr = 'href';
    }
    
    return {
      file: componentInfo.file,
      line: componentInfo.line || 1,
      col: componentInfo.col || 1,
      componentName: componentInfo.componentName,
      targetAttr,
      domPath,
      elementType,
      timestamp: Date.now()
    };
  },
  
  // Verificar se uma seleção é válida para aplicar assets
  isValidForAssets: (selection: ElementSelection | null): boolean => {
    if (!selection) return false;
    
    // Elementos que podem receber imagens
    const validElements = ['img', 'div', 'section', 'header', 'main', 'aside'];
    const validAttrs = ['src', 'image', 'imageSrc', 'icon', 'logo', 'href'];
    
    return (
      validElements.includes(selection.elementType || '') ||
      validAttrs.includes(selection.targetAttr || '')
    );
  },
  
  // Formatar informações da seleção para exibição
  formatSelectionInfo: (selection: ElementSelection | null): string => {
    if (!selection) return 'Nenhum elemento selecionado';
    
    const parts = [
      `Componente: ${selection.componentName}`,
      `Arquivo: ${selection.file}`,
      selection.elementType && `Elemento: <${selection.elementType}>`,
      selection.targetAttr && `Atributo: ${selection.targetAttr}`
    ].filter(Boolean);
    
    return parts.join(' • ');
  }
};

// Função auxiliar para obter o caminho DOM de um elemento
function getDomPath(element: Element): string {
  const path: string[] = [];
  let current: Element | null = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    // Adicionar ID se existir
    if (current.id) {
      selector += `#${current.id}`;
    }
    
    // Adicionar classes se existirem
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).slice(0, 2); // Máximo 2 classes
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`;
      }
    }
    
    // Adicionar índice se necessário (para elementos sem ID/classe únicos)
    if (!current.id && (!current.className || current.className.trim() === '')) {
      const siblings = Array.from(current.parentElement?.children || []);
      const sameTagSiblings = siblings.filter(sibling => sibling.tagName === current!.tagName);
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}
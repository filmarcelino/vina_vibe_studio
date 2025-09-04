// Export all types and interfaces
export * from './types';
export * from './interfaces';

// Re-export commonly used types for convenience
export type {
  ElementInfo,
  OverlayConfig,
  OverlayState,
  SelectionEvent,
  ComponentMapping,
  VisualHierarchy,
  ExtractionResult,
  CodeGenerationContext,
  GeneratedComponent,
  ExtractedDesign
} from './types';

export type {
  IOverlayMapper,
  IElementAnalyzer,
  IOverlayRenderer,
  ICodeGenerator,
  IElementFilter,
  IResponsiveAnalyzer,
  IAccessibilityAnalyzer
} from './interfaces';

// DOM to Code mapping functionality
export type Located = {
  file: string;
  line: number;
  col: number;
  componentName: string;
};

export function locateComponentByDomPath(domPath: string): Located {
  // MVP estático: retornar algo plausível
  console.log('Locating component for domPath:', domPath);
  return {
    file: 'src/app/page.tsx',
    line: 1,
    col: 1,
    componentName: 'Demo'
  };
}
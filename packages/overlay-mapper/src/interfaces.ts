import {
  ElementInfo,
  OverlayConfig,
  OverlayState,
  SelectionEvent,
  ComponentMapping,
  VisualHierarchy,
  ExtractionResult,
  OverlayOptions,
  CodeGenerationContext,
  GeneratedComponent,
  ExtractedDesign,
  LayoutAnalysis,
  ResponsiveBreakpoint
} from './types';

// Main interface for overlay functionality
export interface IOverlayMapper {
  // Initialization and lifecycle
  initialize(options?: OverlayOptions): Promise<void>;
  destroy(): void;
  
  // State management
  getState(): OverlayState;
  updateConfig(config: Partial<OverlayConfig>): void;
  
  // Overlay control
  activate(): void;
  deactivate(): void;
  toggle(): void;
  
  // Element detection and extraction
  extractElements(container?: HTMLElement): Promise<ExtractionResult>;
  getElementInfo(element: HTMLElement): ElementInfo;
  getElementHierarchy(element: HTMLElement): VisualHierarchy;
  
  // Selection and interaction
  selectElement(element: HTMLElement | string): void;
  clearSelection(): void;
  highlightElement(element: HTMLElement | string): void;
  clearHighlight(): void;
  
  // Event handling
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback?: (data: any) => void): void;
  emit(event: string, data: any): void;
}

// Interface for element analysis
export interface IElementAnalyzer {
  // Element inspection
  analyzeElement(element: HTMLElement): ElementInfo;
  getElementBounds(element: HTMLElement): ElementInfo['bounds'];
  generateSelector(element: HTMLElement): string;
  generateXPath(element: HTMLElement): string;
  
  // Component detection
  detectComponent(element: HTMLElement): ComponentMapping | null;
  extractProps(element: HTMLElement, mapping: ComponentMapping): Record<string, any>;
  
  // Hierarchy analysis
  buildHierarchy(elements: HTMLElement[]): VisualHierarchy;
  findParentComponent(element: HTMLElement): HTMLElement | null;
  getChildComponents(element: HTMLElement): HTMLElement[];
}

// Interface for visual overlay rendering
export interface IOverlayRenderer {
  // Overlay management
  createOverlay(element: ElementInfo): HTMLElement;
  updateOverlay(overlayId: string, element: ElementInfo): void;
  removeOverlay(overlayId: string): void;
  clearAllOverlays(): void;
  
  // Visual feedback
  showBounds(element: ElementInfo): void;
  showLabel(element: ElementInfo, text: string): void;
  showHierarchy(hierarchy: VisualHierarchy): void;
  
  // Styling
  applyTheme(theme: Partial<OverlayOptions['theme']>): void;
  updateStyles(overlayId: string, styles: Partial<CSSStyleDeclaration>): void;
}

// Interface for code generation from visual elements
export interface ICodeGenerator {
  // Component generation
  generateComponent(element: ElementInfo, context: CodeGenerationContext): Promise<GeneratedComponent>;
  generateComponentTree(hierarchy: VisualHierarchy, context: CodeGenerationContext): Promise<GeneratedComponent>;
  
  // Style extraction
  extractStyles(element: HTMLElement, context: CodeGenerationContext): Promise<string>;
  generateStylesheet(elements: ElementInfo[], context: CodeGenerationContext): Promise<string>;
  
  // Layout analysis
  analyzeLayout(container: HTMLElement): Promise<LayoutAnalysis>;
  generateLayoutCode(analysis: LayoutAnalysis, context: CodeGenerationContext): Promise<string>;
  
  // Design system extraction
  extractDesignSystem(elements: ElementInfo[]): Promise<ExtractedDesign>;
  generateDesignTokens(design: ExtractedDesign): Promise<string>;
}

// Interface for element filtering and selection
export interface IElementFilter {
  // Filtering
  filterBySelector(elements: HTMLElement[], selector: string): HTMLElement[];
  filterBySize(elements: HTMLElement[], minSize: { width: number; height: number }): HTMLElement[];
  filterByVisibility(elements: HTMLElement[]): HTMLElement[];
  filterByType(elements: HTMLElement[], types: string[]): HTMLElement[];
  
  // Custom filters
  addFilter(name: string, filter: (element: HTMLElement) => boolean): void;
  removeFilter(name: string): void;
  applyFilters(elements: HTMLElement[], filterNames: string[]): HTMLElement[];
}

// Interface for responsive design detection
export interface IResponsiveAnalyzer {
  // Breakpoint detection
  detectBreakpoints(element: HTMLElement): Promise<ResponsiveBreakpoint[]>;
  analyzeResponsiveBehavior(element: HTMLElement): Promise<ResponsiveAnalysis>;
  
  // Media query extraction
  extractMediaQueries(stylesheet: CSSStyleSheet): MediaQueryRule[];
  generateResponsiveCode(analysis: ResponsiveAnalysis, context: CodeGenerationContext): Promise<string>;
}

// Interface for accessibility analysis
export interface IAccessibilityAnalyzer {
  // A11y analysis
  analyzeAccessibility(element: HTMLElement): Promise<AccessibilityReport>;
  checkAriaAttributes(element: HTMLElement): AriaAnalysis;
  checkColorContrast(element: HTMLElement): ContrastAnalysis;
  checkKeyboardNavigation(container: HTMLElement): KeyboardAnalysis;
  
  // Suggestions
  generateA11ySuggestions(report: AccessibilityReport): AccessibilitySuggestion[];
}

// Supporting interfaces

export interface ResponsiveAnalysis {
  breakpoints: ResponsiveBreakpoint[];
  flexibleElements: ElementInfo[];
  fixedElements: ElementInfo[];
  recommendations: string[];
}

export interface MediaQueryRule {
  media: string;
  rules: CSSRule[];
}

export interface AccessibilityReport {
  score: number; // 0-100
  issues: AccessibilityIssue[];
  suggestions: AccessibilitySuggestion[];
  compliance: ComplianceLevel;
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  description: string;
  element: ElementInfo;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface AccessibilitySuggestion {
  description: string;
  code?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AriaAnalysis {
  hasAriaLabel: boolean;
  hasAriaDescribedBy: boolean;
  hasRole: boolean;
  ariaAttributes: Record<string, string>;
  issues: string[];
}

export interface ContrastAnalysis {
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
  };
  foregroundColor: string;
  backgroundColor: string;
}

export interface KeyboardAnalysis {
  focusableElements: ElementInfo[];
  tabOrder: number[];
  trapsFocus: boolean;
  hasSkipLinks: boolean;
  issues: string[];
}

export type ComplianceLevel = 'A' | 'AA' | 'AAA' | 'none';
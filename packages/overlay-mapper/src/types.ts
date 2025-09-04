// Types for visual overlay mapping and element detection

export interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface ElementInfo {
  id: string;
  tagName: string;
  className?: string;
  textContent?: string;
  attributes: Record<string, string>;
  bounds: ElementBounds;
  selector: string;
  xpath: string;
  componentName?: string;
  componentProps?: Record<string, any>;
}

export interface OverlayConfig {
  showBounds: boolean;
  showLabels: boolean;
  showHierarchy: boolean;
  highlightOnHover: boolean;
  enableSelection: boolean;
  excludeSelectors?: string[];
  includeSelectors?: string[];
  minElementSize?: { width: number; height: number };
}

export interface OverlayState {
  isActive: boolean;
  selectedElement?: ElementInfo;
  hoveredElement?: ElementInfo;
  elements: ElementInfo[];
  config: OverlayConfig;
}

export interface SelectionEvent {
  type: 'select' | 'hover' | 'unhover';
  element: ElementInfo;
  originalEvent: MouseEvent;
  timestamp: Date;
}

export interface ComponentMapping {
  selector: string;
  componentName: string;
  propsExtractor?: (element: HTMLElement) => Record<string, any>;
  childrenExtractor?: (element: HTMLElement) => ComponentMapping[];
}

export interface VisualHierarchy {
  element: ElementInfo;
  children: VisualHierarchy[];
  parent?: VisualHierarchy;
  depth: number;
}

export interface OverlayTheme {
  borderColor: string;
  backgroundColor: string;
  labelColor: string;
  labelBackgroundColor: string;
  hoverBorderColor: string;
  selectedBorderColor: string;
  fontSize: string;
  fontFamily: string;
  zIndex: number;
}

export interface ExtractionResult {
  success: boolean;
  elements: ElementInfo[];
  hierarchy: VisualHierarchy;
  components: ComponentMapping[];
  metadata: ExtractionMetadata;
}

export interface ExtractionMetadata {
  timestamp: Date;
  url: string;
  viewport: { width: number; height: number };
  totalElements: number;
  processingTime: number;
  version: string;
}

export interface OverlayOptions {
  theme?: Partial<OverlayTheme>;
  config?: Partial<OverlayConfig>;
  onSelection?: (event: SelectionEvent) => void;
  onHover?: (event: SelectionEvent) => void;
  componentMappings?: ComponentMapping[];
}

// Code generation related types
export interface CodeGenerationContext {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  language: 'typescript' | 'javascript';
  styleFramework: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion';
  componentLibrary?: string;
}

export interface GeneratedComponent {
  name: string;
  code: string;
  imports: string[];
  props: ComponentProp[];
  children?: GeneratedComponent[];
  styles?: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface LayoutAnalysis {
  type: 'grid' | 'flex' | 'absolute' | 'flow';
  direction?: 'row' | 'column';
  alignment?: string;
  spacing?: number;
  responsive: boolean;
  breakpoints?: ResponsiveBreakpoint[];
}

export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  changes: StyleChange[];
}

export interface StyleChange {
  property: string;
  value: string;
  selector?: string;
}

export interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border';
  category?: string;
  description?: string;
}

export interface ExtractedDesign {
  colors: DesignToken[];
  typography: DesignToken[];
  spacing: DesignToken[];
  shadows: DesignToken[];
  borders: DesignToken[];
  layout: LayoutAnalysis;
  components: GeneratedComponent[];
}
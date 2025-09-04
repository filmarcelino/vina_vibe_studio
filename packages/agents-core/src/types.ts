// Core types for AI agents and code generation

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentSession {
  id: string;
  messages: AgentMessage[];
  context?: AgentContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentContext {
  projectType?: 'react' | 'vue' | 'angular' | 'vanilla';
  framework?: string;
  dependencies?: string[];
  currentFiles?: FileContext[];
  userPreferences?: UserPreferences;
}

export interface FileContext {
  path: string;
  content: string;
  language: string;
  lastModified: Date;
}

export interface UserPreferences {
  codeStyle?: 'typescript' | 'javascript';
  cssFramework?: 'tailwind' | 'bootstrap' | 'css-modules' | 'styled-components';
  componentLibrary?: 'shadcn' | 'mui' | 'antd' | 'chakra';
  testingFramework?: 'jest' | 'vitest' | 'cypress' | 'playwright';
}

export interface CodeGenerationRequest {
  prompt: string;
  context?: AgentContext;
  targetFiles?: string[];
  generationType: 'component' | 'page' | 'hook' | 'utility' | 'full-app';
  constraints?: GenerationConstraints;
}

export interface GenerationConstraints {
  maxFiles?: number;
  excludePatterns?: string[];
  includeTests?: boolean;
  includeDocumentation?: boolean;
  codeStyle?: 'functional' | 'class-based' | 'mixed';
}

export interface CodeGenerationResponse {
  success: boolean;
  files: GeneratedFile[];
  dependencies?: string[];
  instructions?: string[];
  errors?: string[];
  metadata?: GenerationMetadata;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  type: 'component' | 'page' | 'hook' | 'utility' | 'config' | 'test' | 'style';
  description?: string;
}

export interface GenerationMetadata {
  tokensUsed?: number;
  processingTime?: number;
  model?: string;
  version?: string;
  confidence?: number;
}

export interface AgentCapabilities {
  canGenerateComponents: boolean;
  canGeneratePages: boolean;
  canGenerateHooks: boolean;
  canGenerateUtils: boolean;
  canGenerateTests: boolean;
  canGenerateStyles: boolean;
  canRefactorCode: boolean;
  canOptimizeCode: boolean;
  supportedFrameworks: string[];
  supportedLanguages: string[];
}

export interface AgentConfig {
  name: string;
  version: string;
  capabilities: AgentCapabilities;
  defaultContext?: Partial<AgentContext>;
  rateLimits?: RateLimits;
}

export interface RateLimits {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  maxTokensPerRequest?: number;
  maxFilesPerRequest?: number;
}

// Event types for real-time communication
export interface AgentEvent {
  type: AgentEventType;
  sessionId: string;
  data: any;
  timestamp: Date;
}

export type AgentEventType =
  | 'session_started'
  | 'message_received'
  | 'generation_started'
  | 'generation_progress'
  | 'generation_completed'
  | 'generation_failed'
  | 'file_created'
  | 'file_updated'
  | 'file_deleted'
  | 'session_ended';

export interface GenerationProgress {
  stage: 'analyzing' | 'planning' | 'generating' | 'validating' | 'finalizing';
  progress: number; // 0-100
  currentFile?: string;
  message?: string;
}
import {
  AgentMessage,
  AgentSession,
  AgentContext,
  CodeGenerationRequest,
  CodeGenerationResponse,
  AgentCapabilities,
  AgentConfig,
  AgentEvent,
  GenerationProgress
} from './types';

// Base interface for all AI agents
export interface IAgent {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: AgentCapabilities;
  
  // Session management
  createSession(context?: AgentContext): Promise<AgentSession>;
  getSession(sessionId: string): Promise<AgentSession | null>;
  updateSession(sessionId: string, session: Partial<AgentSession>): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Message handling
  sendMessage(sessionId: string, message: AgentMessage): Promise<AgentMessage>;
  getMessages(sessionId: string, limit?: number): Promise<AgentMessage[]>;
  
  // Code generation
  generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse>;
  
  // Configuration
  getConfig(): AgentConfig;
  updateConfig(config: Partial<AgentConfig>): Promise<void>;
}

// Interface for code generation agents
export interface ICodeGenerationAgent extends IAgent {
  // Advanced code generation methods
  generateComponent(prompt: string, context?: AgentContext): Promise<CodeGenerationResponse>;
  generatePage(prompt: string, context?: AgentContext): Promise<CodeGenerationResponse>;
  generateHook(prompt: string, context?: AgentContext): Promise<CodeGenerationResponse>;
  generateUtility(prompt: string, context?: AgentContext): Promise<CodeGenerationResponse>;
  
  // Code analysis and refactoring
  analyzeCode(code: string, language: string): Promise<CodeAnalysis>;
  refactorCode(code: string, instructions: string): Promise<CodeGenerationResponse>;
  optimizeCode(code: string, language: string): Promise<CodeGenerationResponse>;
  
  // Validation
  validateGeneration(response: CodeGenerationResponse): Promise<ValidationResult>;
}

// Interface for real-time communication
export interface IAgentEventEmitter {
  // Event subscription
  on(event: string, listener: (data: AgentEvent) => void): void;
  off(event: string, listener: (data: AgentEvent) => void): void;
  emit(event: string, data: AgentEvent): void;
  
  // Progress tracking
  onProgress(sessionId: string, callback: (progress: GenerationProgress) => void): void;
  offProgress(sessionId: string): void;
}

// Interface for agent registry
export interface IAgentRegistry {
  // Agent management
  registerAgent(agent: IAgent): Promise<void>;
  unregisterAgent(agentId: string): Promise<void>;
  getAgent(agentId: string): Promise<IAgent | null>;
  listAgents(): Promise<IAgent[]>;
  
  // Agent discovery
  findAgentsByCapability(capability: keyof AgentCapabilities): Promise<IAgent[]>;
  findAgentsByFramework(framework: string): Promise<IAgent[]>;
  getBestAgent(request: CodeGenerationRequest): Promise<IAgent | null>;
}

// Interface for session storage
export interface ISessionStorage {
  // Session CRUD operations
  createSession(session: AgentSession): Promise<void>;
  getSession(sessionId: string): Promise<AgentSession | null>;
  updateSession(sessionId: string, updates: Partial<AgentSession>): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Session queries
  getSessionsByAgent(agentId: string): Promise<AgentSession[]>;
  getRecentSessions(limit?: number): Promise<AgentSession[]>;
  searchSessions(query: string): Promise<AgentSession[]>;
  
  // Cleanup
  cleanupExpiredSessions(maxAge: number): Promise<number>;
}

// Interface for context management
export interface IContextManager {
  // Context operations
  createContext(projectPath: string): Promise<AgentContext>;
  updateContext(context: AgentContext, changes: Partial<AgentContext>): Promise<AgentContext>;
  
  // File operations
  addFileToContext(context: AgentContext, filePath: string): Promise<AgentContext>;
  removeFileFromContext(context: AgentContext, filePath: string): Promise<AgentContext>;
  
  // Analysis
  analyzeProject(projectPath: string): Promise<ProjectAnalysis>;
  detectFramework(projectPath: string): Promise<string | null>;
  extractDependencies(projectPath: string): Promise<string[]>;
}

// Supporting interfaces
export interface CodeAnalysis {
  complexity: number;
  maintainability: number;
  testCoverage?: number;
  issues: CodeIssue[];
  suggestions: string[];
  metrics: CodeMetrics;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  rule?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CodeMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  technicalDebt?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number; // 0-100
}

export interface ProjectAnalysis {
  framework: string | null;
  language: 'typescript' | 'javascript';
  dependencies: string[];
  devDependencies: string[];
  structure: ProjectStructure;
  patterns: DetectedPattern[];
  recommendations: string[];
}

export interface ProjectStructure {
  hasComponents: boolean;
  hasPages: boolean;
  hasHooks: boolean;
  hasUtils: boolean;
  hasTests: boolean;
  hasStyles: boolean;
  directories: string[];
  entryPoints: string[];
}

export interface DetectedPattern {
  name: string;
  confidence: number;
  description: string;
  examples: string[];
}
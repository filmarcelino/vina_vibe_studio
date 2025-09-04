import {
  DataAdapter,
  FileSystemAdapter,
  APIAdapter,
  DatabaseAdapter,
  CacheAdapter,
  EventAdapter,
  AdapterRegistry,
  AdapterFactory,
  ValidationResult,
  AdapterCapabilities,
  JSONSchema,
  DatabaseConfig,
  AuthConfig,
  CacheStats,
  EventMessage,
  Subscription
} from './types';

// Base adapter manager interface
export interface IAdapterManager {
  // Registry management
  registerAdapter(adapter: DataAdapter): void;
  unregisterAdapter(id: string): void;
  getAdapter(id: string): DataAdapter | null;
  listAdapters(): DataAdapter[];
  
  // Adapter lifecycle
  initializeAdapter(id: string, config?: any): Promise<void>;
  destroyAdapter(id: string): Promise<void>;
  
  // Capability queries
  findAdaptersByCapability(capability: keyof AdapterCapabilities): DataAdapter[];
  getAdapterCapabilities(id: string): AdapterCapabilities | null;
}

// Configuration manager interface
export interface IConfigurationManager {
  // Configuration management
  setConfig(adapterId: string, config: any): void;
  getConfig(adapterId: string): any;
  updateConfig(adapterId: string, updates: Partial<any>): void;
  removeConfig(adapterId: string): void;
  
  // Schema validation
  validateConfig(adapterId: string, config: any): ValidationResult;
  getConfigSchema(adapterId: string): JSONSchema | null;
  
  // Environment management
  setEnvironment(env: string): void;
  getEnvironment(): string;
  getEnvironmentConfig(adapterId: string, env: string): any;
}

// Connection pool interface
export interface IConnectionPool {
  // Pool management
  createPool(adapterId: string, config: any): Promise<void>;
  destroyPool(adapterId: string): Promise<void>;
  
  // Connection management
  getConnection(adapterId: string): Promise<any>;
  releaseConnection(adapterId: string, connection: any): void;
  
  // Pool statistics
  getPoolStats(adapterId: string): PoolStats;
  getActiveConnections(adapterId: string): number;
  getIdleConnections(adapterId: string): number;
}

export interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  created: number;
  destroyed: number;
}

// Monitoring and metrics interface
export interface IAdapterMonitor {
  // Metrics collection
  recordOperation(adapterId: string, operation: string, duration: number, success: boolean): void;
  recordError(adapterId: string, operation: string, error: Error): void;
  
  // Metrics retrieval
  getMetrics(adapterId: string): AdapterMetrics;
  getOperationMetrics(adapterId: string, operation: string): OperationMetrics;
  
  // Health checks
  checkHealth(adapterId: string): Promise<HealthStatus>;
  getHealthStatus(adapterId: string): HealthStatus;
  
  // Alerts
  setThreshold(adapterId: string, metric: string, threshold: number): void;
  onThresholdExceeded(callback: (alert: ThresholdAlert) => void): void;
}

export interface AdapterMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  uptime: number;
}

export interface OperationMetrics {
  count: number;
  successCount: number;
  errorCount: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastExecuted: Date;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  errors: string[];
  details: Record<string, any>;
}

export interface ThresholdAlert {
  adapterId: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
}

// Caching interface for adapter results
export interface IAdapterCache {
  // Cache operations
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(pattern?: string): Promise<void>;
  
  // Cache strategies
  setStrategy(adapterId: string, strategy: CacheStrategy): void;
  getStrategy(adapterId: string): CacheStrategy;
  
  // Cache statistics
  getStats(): CacheStats;
  getCacheHitRatio(): number;
}

export interface CacheStrategy {
  enabled: boolean;
  ttl: number;
  maxSize?: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl';
  keyGenerator?: (operation: string, params: any) => string;
}

// Security and authentication interface
export interface ISecurityManager {
  // Authentication
  authenticate(adapterId: string, credentials: any): Promise<AuthResult>;
  refreshToken(adapterId: string): Promise<string>;
  revokeToken(adapterId: string): Promise<void>;
  
  // Authorization
  authorize(adapterId: string, operation: string, resource?: string): Promise<boolean>;
  checkPermissions(adapterId: string, permissions: string[]): Promise<PermissionResult>;
  
  // Encryption
  encrypt(data: any, adapterId?: string): Promise<string>;
  decrypt(encryptedData: string, adapterId?: string): Promise<any>;
  
  // Audit
  logAccess(adapterId: string, operation: string, user?: string): void;
  getAuditLog(adapterId: string, filters?: AuditFilters): Promise<AuditEntry[]>;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  expiresAt?: Date;
  refreshToken?: string;
  user?: UserInfo;
  error?: string;
}

export interface PermissionResult {
  granted: string[];
  denied: string[];
  partial: boolean;
}

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  roles: string[];
  permissions: string[];
}

export interface AuditFilters {
  startDate?: Date;
  endDate?: Date;
  operation?: string;
  user?: string;
  success?: boolean;
}

export interface AuditEntry {
  id: string;
  adapterId: string;
  operation: string;
  user?: string;
  timestamp: Date;
  success: boolean;
  details?: Record<string, any>;
  error?: string;
}

// Data transformation interface
export interface IDataTransformer {
  // Transformation
  transform(data: any, schema: TransformationSchema): Promise<any>;
  validate(data: any, schema: ValidationSchema): ValidationResult;
  
  // Schema management
  registerSchema(name: string, schema: TransformationSchema): void;
  getSchema(name: string): TransformationSchema | null;
  listSchemas(): string[];
  
  // Custom transformers
  registerTransformer(name: string, transformer: TransformerFunction): void;
  getTransformer(name: string): TransformerFunction | null;
}

export interface TransformationSchema {
  input: JSONSchema;
  output: JSONSchema;
  rules: TransformationRule[];
}

export interface ValidationSchema {
  schema: JSONSchema;
  strict?: boolean;
  allowAdditional?: boolean;
}

export interface TransformationRule {
  source: string;
  target: string;
  transformer?: string;
  condition?: string;
  defaultValue?: any;
}

export type TransformerFunction = (value: any, context?: any) => any;

// Batch processing interface
export interface IBatchProcessor {
  // Batch operations
  processBatch(adapterId: string, operations: BatchOperation[]): Promise<BatchResult[]>;
  
  // Batch configuration
  setBatchSize(adapterId: string, size: number): void;
  getBatchSize(adapterId: string): number;
  
  // Batch monitoring
  getBatchStatus(batchId: string): BatchStatus;
  cancelBatch(batchId: string): Promise<void>;
  
  // Batch events
  onBatchComplete(callback: (result: BatchResult) => void): void;
  onBatchError(callback: (error: BatchError) => void): void;
}

export interface BatchOperation {
  id: string;
  operation: string;
  data: any;
  options?: any;
}

export interface BatchResult {
  batchId: string;
  operations: OperationResult[];
  totalCount: number;
  successCount: number;
  errorCount: number;
  duration: number;
  startTime: Date;
  endTime: Date;
}

export interface OperationResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

export interface BatchStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  startTime: Date;
  estimatedCompletion?: Date;
}

export interface BatchError {
  batchId: string;
  operationId: string;
  error: Error;
  timestamp: Date;
}

// Streaming interface
export interface IStreamProcessor {
  // Stream creation
  createReadStream(adapterId: string, source: any): Promise<ReadableStream>;
  createWriteStream(adapterId: string, destination: any): Promise<WritableStream>;
  
  // Stream processing
  pipe(readStream: ReadableStream, writeStream: WritableStream): Promise<void>;
  transform(stream: ReadableStream, transformer: StreamTransformer): ReadableStream;
  
  // Stream monitoring
  getStreamStats(streamId: string): StreamStats;
  onStreamEvent(callback: (event: StreamEvent) => void): void;
}

export interface StreamTransformer {
  transform(chunk: any): any | Promise<any>;
  flush?(): any | Promise<any>;
}

export interface StreamStats {
  id: string;
  bytesRead: number;
  bytesWritten: number;
  chunksProcessed: number;
  duration: number;
  throughput: number;
}

export interface StreamEvent {
  type: 'start' | 'data' | 'end' | 'error';
  streamId: string;
  data?: any;
  error?: Error;
  timestamp: Date;
}
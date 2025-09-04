// Base data adapter types
export interface DataAdapter<TInput = any, TOutput = any> {
  id: string;
  name: string;
  version: string;
  description?: string;
  
  // Core functionality
  transform(input: TInput): Promise<TOutput> | TOutput;
  validate(input: TInput): boolean | ValidationResult;
  
  // Metadata
  getInputSchema(): JSONSchema | null;
  getOutputSchema(): JSONSchema | null;
  getCapabilities(): AdapterCapabilities;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
  value?: any;
}

// Adapter capabilities
export interface AdapterCapabilities {
  supportsStreaming: boolean;
  supportsBatching: boolean;
  supportsRealtime: boolean;
  maxInputSize?: number;
  supportedFormats: string[];
  requiredPermissions?: string[];
}

// JSON Schema definition
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  additionalProperties?: boolean | JSONSchema;
  enum?: any[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  description?: string;
}

// File system adapter types
export interface FileSystemAdapter extends DataAdapter<FileInput, FileOutput> {
  // File operations
  readFile(path: string): Promise<FileContent>;
  writeFile(path: string, content: string | Buffer): Promise<void>;
  deleteFile(path: string): Promise<void>;
  
  // Directory operations
  listDirectory(path: string): Promise<DirectoryListing>;
  createDirectory(path: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
  
  // File watching
  watchFile(path: string, callback: (event: FileWatchEvent) => void): FileWatcher;
  watchDirectory(path: string, callback: (event: DirectoryWatchEvent) => void): DirectoryWatcher;
}

export interface FileInput {
  path: string;
  operation: 'read' | 'write' | 'delete' | 'watch';
  content?: string | Buffer;
  options?: FileOptions;
}

export interface FileOutput {
  success: boolean;
  content?: FileContent;
  metadata?: FileMetadata;
  error?: string;
}

export interface FileContent {
  data: string | Buffer;
  encoding: string;
  size: number;
}

export interface FileMetadata {
  path: string;
  size: number;
  created: Date;
  modified: Date;
  accessed: Date;
  isDirectory: boolean;
  permissions: FilePermissions;
}

export interface FilePermissions {
  readable: boolean;
  writable: boolean;
  executable: boolean;
}

export interface FileOptions {
  encoding?: string;
  recursive?: boolean;
  overwrite?: boolean;
}

export interface DirectoryListing {
  path: string;
  entries: DirectoryEntry[];
}

export interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: Date;
}

export interface FileWatchEvent {
  type: 'change' | 'rename' | 'delete';
  path: string;
  timestamp: Date;
}

export interface DirectoryWatchEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  timestamp: Date;
}

export interface FileWatcher {
  close(): void;
  isActive(): boolean;
}

export interface DirectoryWatcher {
  close(): void;
  isActive(): boolean;
  addPath(path: string): void;
  removePath(path: string): void;
}

// API adapter types
export interface APIAdapter extends DataAdapter<APIRequest, APIResponse> {
  // HTTP methods
  get(url: string, options?: RequestOptions): Promise<APIResponse>;
  post(url: string, data?: any, options?: RequestOptions): Promise<APIResponse>;
  put(url: string, data?: any, options?: RequestOptions): Promise<APIResponse>;
  delete(url: string, options?: RequestOptions): Promise<APIResponse>;
  patch(url: string, data?: any, options?: RequestOptions): Promise<APIResponse>;
  
  // Configuration
  setBaseURL(url: string): void;
  setDefaultHeaders(headers: Record<string, string>): void;
  setAuth(auth: AuthConfig): void;
  
  // Interceptors
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
}

export interface APIRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
}

export interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  config: APIRequest;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  validateStatus?: (status: number) => boolean;
}

export interface AuthConfig {
  type: 'bearer' | 'basic' | 'api-key' | 'oauth';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

export type RequestInterceptor = (config: APIRequest) => APIRequest | Promise<APIRequest>;
export type ResponseInterceptor = (response: APIResponse) => APIResponse | Promise<APIResponse>;

// Database adapter types
export interface DatabaseAdapter extends DataAdapter<DatabaseQuery, DatabaseResult> {
  // Connection management
  connect(config: DatabaseConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Query operations
  query(sql: string, params?: any[]): Promise<DatabaseResult>;
  execute(sql: string, params?: any[]): Promise<DatabaseResult>;
  
  // Transaction support
  beginTransaction(): Promise<DatabaseTransaction>;
  
  // Schema operations
  getSchema(): Promise<DatabaseSchema>;
  getTables(): Promise<TableInfo[]>;
  getColumns(tableName: string): Promise<ColumnInfo[]>;
}

export interface DatabaseQuery {
  sql: string;
  params?: any[];
  options?: QueryOptions;
}

export interface DatabaseResult {
  rows: any[];
  rowCount: number;
  fields: FieldInfo[];
  affectedRows?: number;
  insertId?: any;
}

export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  connectionString?: string;
  options?: Record<string, any>;
}

export interface QueryOptions {
  timeout?: number;
  maxRows?: number;
  streaming?: boolean;
}

export interface DatabaseTransaction {
  query(sql: string, params?: any[]): Promise<DatabaseResult>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface DatabaseSchema {
  name: string;
  tables: TableInfo[];
  views: ViewInfo[];
  procedures: ProcedureInfo[];
}

export interface TableInfo {
  name: string;
  schema?: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  maxLength?: number;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
}

export interface ConstraintInfo {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
}

export interface ViewInfo {
  name: string;
  schema?: string;
  definition: string;
}

export interface ProcedureInfo {
  name: string;
  schema?: string;
  parameters: ParameterInfo[];
}

export interface ParameterInfo {
  name: string;
  type: string;
  direction: 'IN' | 'OUT' | 'INOUT';
}

export interface FieldInfo {
  name: string;
  type: string;
  length?: number;
}

// Cache adapter types
export interface CacheAdapter extends DataAdapter<CacheOperation, CacheResult> {
  // Basic operations
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Batch operations
  mget(keys: string[]): Promise<Record<string, any>>;
  mset(entries: Record<string, any>, ttl?: number): Promise<void>;
  mdelete(keys: string[]): Promise<number>;
  
  // Advanced operations
  increment(key: string, delta?: number): Promise<number>;
  decrement(key: string, delta?: number): Promise<number>;
  expire(key: string, ttl: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
  
  // Pattern operations
  keys(pattern: string): Promise<string[]>;
  clear(pattern?: string): Promise<number>;
  
  // Statistics
  getStats(): Promise<CacheStats>;
}

export interface CacheOperation {
  type: 'get' | 'set' | 'delete' | 'exists' | 'increment' | 'decrement' | 'expire' | 'ttl';
  key: string;
  value?: any;
  ttl?: number;
  delta?: number;
}

export interface CacheResult {
  success: boolean;
  value?: any;
  exists?: boolean;
  ttl?: number;
  error?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  uptime: number;
}

// Event adapter types
export interface EventAdapter extends DataAdapter<EventMessage, EventResult> {
  // Publishing
  publish(topic: string, message: any, options?: PublishOptions): Promise<void>;
  
  // Subscribing
  subscribe(topic: string, handler: EventHandler, options?: SubscribeOptions): Promise<Subscription>;
  unsubscribe(subscription: Subscription): Promise<void>;
  
  // Topic management
  createTopic(topic: string, config?: TopicConfig): Promise<void>;
  deleteTopic(topic: string): Promise<void>;
  listTopics(): Promise<string[]>;
  
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export interface EventMessage {
  topic: string;
  payload: any;
  headers?: Record<string, string>;
  timestamp?: Date;
  id?: string;
}

export interface EventResult {
  success: boolean;
  messageId?: string;
  timestamp?: Date;
  error?: string;
}

export interface PublishOptions {
  headers?: Record<string, string>;
  partition?: string;
  key?: string;
  timestamp?: Date;
}

export interface SubscribeOptions {
  group?: string;
  partition?: string;
  offset?: 'earliest' | 'latest' | number;
  autoCommit?: boolean;
}

export interface TopicConfig {
  partitions?: number;
  replicationFactor?: number;
  retentionMs?: number;
  cleanupPolicy?: 'delete' | 'compact';
}

export type EventHandler = (message: EventMessage) => Promise<void> | void;

export interface Subscription {
  id: string;
  topic: string;
  handler: EventHandler;
  options: SubscribeOptions;
  unsubscribe(): Promise<void>;
}

// Adapter registry types
export interface AdapterRegistry {
  register(adapter: DataAdapter): void;
  unregister(id: string): void;
  get(id: string): DataAdapter | null;
  list(): DataAdapter[];
  findByCapability(capability: keyof AdapterCapabilities): DataAdapter[];
}

// Adapter factory types
export interface AdapterFactory {
  create(type: string, config: any): Promise<DataAdapter>;
  getSupportedTypes(): string[];
  getConfigSchema(type: string): JSONSchema | null;
}
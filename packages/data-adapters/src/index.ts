// Export all types and interfaces
export * from './types';
export * from './interfaces';

// Re-export commonly used types for convenience
export type {
  DataAdapter,
  FileSystemAdapter,
  APIAdapter,
  DatabaseAdapter,
  CacheAdapter,
  EventAdapter,
  ValidationResult,
  AdapterCapabilities,
  JSONSchema
} from './types';

export type {
  IAdapterManager,
  IConfigurationManager,
  IConnectionPool,
  IAdapterMonitor,
  IAdapterCache,
  ISecurityManager,
  IDataTransformer,
  IBatchProcessor,
  IStreamProcessor
} from './interfaces';
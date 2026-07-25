// DataProvider interface — async, provider-agnostic.
// BismiLLAH Ar-Rahman Ar-Roheem. Both Lightbase and SQLite providers implement this.

export interface DataProvider {
  readonly name: string;
  initializeSchema(): Promise<void>;
  getAll<T = any>(table: string, where?: Record<string, any>): Promise<T[]>;
  getOne<T = any>(table: string, where: Record<string, any>): Promise<T | undefined>;
  getById<T = any>(table: string, id: string): Promise<T | undefined>;
  insert<T = any>(table: string, data: Record<string, any>): Promise<T>;
  update<T = any>(table: string, id: string, data: Record<string, any>): Promise<T | undefined>;
  remove(table: string, id: string): Promise<boolean>;
  removeWhere(table: string, where: Record<string, any>): Promise<number>;
  count(table: string, where?: Record<string, any>): Promise<number>;
  searchProducts(searchQuery: string, filters?: Record<string, any>): Promise<any[]>;
  backupDatabase?(backupPath: string): Promise<void>;
}

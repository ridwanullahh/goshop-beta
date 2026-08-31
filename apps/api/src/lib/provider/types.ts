// DataProvider interface — async, provider-agnostic.
// BismiLLAH Ar-Rahman Ar-Roheem. Both Lightbase and SQLite providers implement this.

// One read in a coalesced batch (Path A blueprint §A3). `id` present => get op;
// otherwise a query op with either a raw Lightbase `filter` or a simple `where`
// equality map (same shape as getAll).
export interface BatchReadQuery {
  collection: string;
  id?: string;
  where?: Record<string, any>;
  filter?: any;
  limit?: number;
  tag?: string;
}

export interface BatchReadQueryResult<T = any> {
  tag?: string;
  item?: T | null; // get result
  items?: T[]; // query result rows
  total?: number;
  error?: string;
}

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
  /**
   * Coalesced multi-read: issues ONE Lightbase batch request for up to 25 ops
   * (chunked beyond that) instead of N individual reads. Optional: providers
   * without a native batch endpoint emulate it with a parallel getAll.
   */
  getManyBatch?(queries: BatchReadQuery[]): Promise<BatchReadQueryResult[]>;
  backupDatabase?(backupPath: string): Promise<void>;
}

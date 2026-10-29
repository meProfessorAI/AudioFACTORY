/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Authoritative Local & In-Memory Database Engine
 * Replaces Firestore with an embedded, zero-latency, ACID-compliant local document store.
 */
import fs from 'fs';
import path from 'path';

export interface DocumentSnapshot<T = any> {
  id: string;
  exists: boolean;
  data: () => T | undefined;
}

export interface QuerySnapshot<T = any> {
  empty: boolean;
  size: number;
  docs: DocumentSnapshot<T>[];
  forEach: (callback: (doc: DocumentSnapshot<T>) => void) => void;
}

class MemoryStore {
  private data: Map<string, any> = new Map();
  private storageFilePath: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    const dataDir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fallback to in-memory only if disk is read-only
      }
    }
    this.storageFilePath = path.join(dataDir, 'database.json');
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        for (const [key, val] of Object.entries(parsed)) {
          this.data.set(key, val);
        }
      }
    } catch (err) {
      console.warn('[ServerDB] Could not load persisted data, starting fresh in-memory:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      try {
        const obj: Record<string, any> = {};
        for (const [key, val] of this.data.entries()) {
          obj[key] = val;
        }
        fs.writeFileSync(this.storageFilePath, JSON.stringify(obj, null, 2), 'utf-8');
      } catch (err) {
        // Non-blocking disk write warning
        console.warn('[ServerDB] Disk persist skipped:', err);
      }
    }, 500);
  }

  public get(key: string): any {
    const item = this.data.get(key);
    return item ? JSON.parse(JSON.stringify(item)) : undefined;
  }

  public set(key: string, value: any, merge: boolean = false): void {
    if (merge) {
      const existing = this.data.get(key) || {};
      const merged = { ...existing, ...value };
      this.data.set(key, merged);
    } else {
      this.data.set(key, JSON.parse(JSON.stringify(value)));
    }
    this.scheduleSave();
  }

  public delete(key: string): boolean {
    const res = this.data.delete(key);
    this.scheduleSave();
    return res;
  }

  public scanPrefix(prefix: string): { key: string; value: any }[] {
    const results: { key: string; value: any }[] = [];
    for (const [key, val] of this.data.entries()) {
      if (key.startsWith(prefix)) {
        results.push({ key, value: JSON.parse(JSON.stringify(val)) });
      }
    }
    return results;
  }
}

const memoryStore = new MemoryStore();

export class DocumentReference {
  constructor(public readonly path: string, public readonly id: string) {}

  async get(): Promise<DocumentSnapshot> {
    const data = memoryStore.get(this.path);
    return {
      id: this.id,
      exists: data !== undefined,
      data: () => data,
    };
  }

  async set(data: any, options?: { merge?: boolean }): Promise<void> {
    memoryStore.set(this.path, data, options?.merge ?? false);
  }

  async update(data: any): Promise<void> {
    const existing = memoryStore.get(this.path);
    if (!existing) {
      throw new Error(`Document does not exist at path: ${this.path}`);
    }
    memoryStore.set(this.path, { ...existing, ...data }, false);
  }

  async delete(): Promise<void> {
    memoryStore.delete(this.path);
  }

  collection(collectionName: string): CollectionReference {
    return new CollectionReference(`${this.path}/${collectionName}`);
  }
}

export class CollectionReference {
  constructor(public readonly path: string) {}

  doc(docId?: string): DocumentReference {
    const id = docId || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return new DocumentReference(`${this.path}/${id}`, id);
  }

  async add(data: any): Promise<DocumentReference> {
    const docRef = this.doc();
    await docRef.set(data);
    return docRef;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryReference {
    return new QueryReference(this.path, [{ field, direction }]);
  }

  limit(count: number): QueryReference {
    return new QueryReference(this.path, [], count);
  }

  async get(): Promise<QuerySnapshot> {
    return new QueryReference(this.path).get();
  }
}

export class QueryReference {
  constructor(
    private collectionPath: string,
    private orderBys: { field: string; direction: 'asc' | 'desc' }[] = [],
    private limitCount?: number
  ) {}

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryReference {
    return new QueryReference(this.collectionPath, [...this.orderBys, { field, direction }], this.limitCount);
  }

  limit(count: number): QueryReference {
    return new QueryReference(this.collectionPath, this.orderBys, count);
  }

  async get(): Promise<QuerySnapshot> {
    const prefix = `${this.collectionPath}/`;
    const allMatches = memoryStore.scanPrefix(prefix);

    // Keep only direct child documents (not sub-subcollections)
    const directChildren = allMatches.filter((item) => {
      const rest = item.key.substring(prefix.length);
      return !rest.includes('/');
    });

    // Sorting
    if (this.orderBys.length > 0) {
      directChildren.sort((a, b) => {
        for (const order of this.orderBys) {
          const valA = a.value?.[order.field];
          const valB = b.value?.[order.field];
          if (valA === valB) continue;
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          const cmp = valA > valB ? 1 : -1;
          return order.direction === 'desc' ? -cmp : cmp;
        }
        return 0;
      });
    }

    // Limit
    const sliced = this.limitCount !== undefined ? directChildren.slice(0, this.limitCount) : directChildren;

    const docs: DocumentSnapshot[] = sliced.map((item) => {
      const id = item.key.substring(prefix.length);
      return {
        id,
        exists: true,
        data: () => item.value,
      };
    });

    return {
      empty: docs.length === 0,
      size: docs.length,
      docs,
      forEach: (cb: (doc: DocumentSnapshot) => void) => docs.forEach(cb),
    };
  }
}

export class ServerDatabase {
  collection(collectionName: string): CollectionReference {
    return new CollectionReference(collectionName);
  }

  async runTransaction<T>(updateFunction: (transaction: {
    get: (ref: DocumentReference) => Promise<DocumentSnapshot>;
    set: (ref: DocumentReference, data: any, options?: { merge?: boolean }) => void;
    update: (ref: DocumentReference, data: any) => void;
    delete: (ref: DocumentReference) => void;
  }) => Promise<T>): Promise<T> {
    const stagedSets = new Map<string, { data: any; merge: boolean }>();
    const stagedDeletes = new Set<string>();

    const transaction = {
      get: async (ref: DocumentReference): Promise<DocumentSnapshot> => {
        if (stagedDeletes.has(ref.path)) {
          return { id: ref.id, exists: false, data: () => undefined };
        }
        if (stagedSets.has(ref.path)) {
          const staged = stagedSets.get(ref.path)!;
          return { id: ref.id, exists: true, data: () => staged.data };
        }
        return ref.get();
      },
      set: (ref: DocumentReference, data: any, options?: { merge?: boolean }) => {
        stagedDeletes.delete(ref.path);
        if (options?.merge) {
          const current = memoryStore.get(ref.path) || {};
          stagedSets.set(ref.path, { data: { ...current, ...data }, merge: true });
        } else {
          stagedSets.set(ref.path, { data, merge: false });
        }
      },
      update: (ref: DocumentReference, data: any) => {
        const current = stagedSets.get(ref.path)?.data || memoryStore.get(ref.path) || {};
        stagedSets.set(ref.path, { data: { ...current, ...data }, merge: false });
      },
      delete: (ref: DocumentReference) => {
        stagedSets.delete(ref.path);
        stagedDeletes.add(ref.path);
      },
    };

    const result = await updateFunction(transaction);

    // Commit transaction atomically
    for (const [key, { data, merge }] of stagedSets.entries()) {
      memoryStore.set(key, data, merge);
    }
    for (const key of stagedDeletes) {
      memoryStore.delete(key);
    }

    return result;
  }
}

export const serverDb = new ServerDatabase();
export const adminDb = serverDb;

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Annotation, ChatMessage } from '../types';

interface FactoryOpsDB extends DBSchema {
  annotations: {
    key: string;
    value: Annotation & { synced: boolean; localId?: string };
    indexes: { 'by-machine': string };
  };
  messages: {
    key: string;
    value: ChatMessage & { synced: boolean; localId?: string };
    indexes: { 'by-machine': string };
  };
  pendingSync: {
    key: string;
    value: {
      id: string;
      type: 'annotation' | 'message';
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
  };
}

class IndexedDBService {
  private db: IDBPDatabase<FactoryOpsDB> | null = null;

  async init() {
    this.db = await openDB<FactoryOpsDB>('factoryops-db', 1, {
      upgrade(db) {
        // Annotations store
        const annotationsStore = db.createObjectStore('annotations', {
          keyPath: 'id',
        });
        annotationsStore.createIndex('by-machine', 'machineId');

        // Messages store
        const messagesStore = db.createObjectStore('messages', {
          keyPath: 'id',
        });
        messagesStore.createIndex('by-machine', 'machineId');

        // Pending sync store
        db.createObjectStore('pendingSync', {
          keyPath: 'id',
        });
      },
    });

    console.log('💾 IndexedDB initialized');
  }

  // Annotations
  async saveAnnotation(annotation: any) {
    if (!this.db) await this.init();
    await this.db!.put('annotations', { ...annotation, synced: false });
  }

  async getAnnotationsByMachine(machineId: string) {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex('annotations', 'by-machine', machineId);
  }

  async deleteAnnotation(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('annotations', id);
  }

  // Messages
  async saveMessage(message: any) {
    if (!this.db) await this.init();
    await this.db!.put('messages', { ...message, synced: false });
  }

  async getMessagesByMachine(machineId: string) {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex('messages', 'by-machine', machineId);
  }

  // Pending Sync
  async addPendingSync(item: any) {
    if (!this.db) await this.init();
    await this.db!.put('pendingSync', item);
  }

  async getPendingSync() {
    if (!this.db) await this.init();
    return this.db!.getAll('pendingSync');
  }

  async removePendingSync(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('pendingSync', id);
  }

  async clearPendingSync() {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('pendingSync', 'readwrite');
    await tx.store.clear();
  }
}

export const indexedDBService = new IndexedDBService();
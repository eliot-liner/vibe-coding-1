import { createStorage } from '../base/base.js';
import { v4 as uuidv4 } from 'uuid';
import type { StorageConfigType, BaseStorageType } from '../base/types.js';
import type { MemoStorageType, MemoState, Memo } from '../types/memo.js';

export class MemoStorage implements MemoStorageType {
  private storage: BaseStorageType<MemoState>;
  private static instance: MemoStorage;

  private constructor(config?: StorageConfigType<MemoState>) {
    const initialState: MemoState = {
      memos: {},
      searchQuery: '',
    };

    this.storage = createStorage<MemoState>('memo-state', initialState, {
      storageEnum: config?.storageEnum,
      liveUpdate: true,
      serialization: {
        serialize: (value: MemoState) => {
          const cleanValue = {
            memos: Object.fromEntries(
              Object.entries(value.memos)
                .filter(([_, memo]) => memo != null)
                .map(([key, memo]) => [
                  key,
                  {
                    ...memo,
                    createdAt: memo.createdAt?.toISOString() ?? new Date().toISOString(),
                    updatedAt: memo.updatedAt?.toISOString() ?? new Date().toISOString(),
                  },
                ]),
            ),
            searchQuery: value.searchQuery ?? '',
          };

          try {
            return JSON.stringify(cleanValue);
          } catch (error) {
            console.error('Failed to serialize state:', error);
            return JSON.stringify({
              memos: {},
              searchQuery: '',
            });
          }
        },
        deserialize: (text: string): MemoState => {
          try {
            const parsed = JSON.parse(text) as {
              memos: Record<
                string,
                Omit<Memo, 'createdAt' | 'updatedAt'> & {
                  createdAt: string;
                  updatedAt: string;
                }
              >;
              searchQuery: string;
            };

            return {
              memos: Object.fromEntries(
                Object.entries(parsed.memos ?? {})
                  .filter(([_, memo]) => memo != null)
                  .map(([key, memo]) => [
                    key,
                    {
                      ...memo,
                      createdAt: new Date(memo.createdAt ?? new Date().toISOString()),
                      updatedAt: new Date(memo.updatedAt ?? new Date().toISOString()),
                    },
                  ]),
              ),
              searchQuery: parsed.searchQuery ?? '',
            };
          } catch (error) {
            console.error('Failed to deserialize state:', error);
            return {
              memos: {},
              searchQuery: '',
            };
          }
        },
      },
    });
  }

  static getInstance(config?: StorageConfigType<MemoState>): MemoStorage {
    if (!MemoStorage.instance) {
      MemoStorage.instance = new MemoStorage(config);
    }
    return MemoStorage.instance;
  }

  async get(): Promise<MemoState> {
    return this.storage.get();
  }

  async set(value: MemoState | ((prev: MemoState) => Promise<MemoState> | MemoState)): Promise<void> {
    await this.storage.set(value);
  }

  getSnapshot(): MemoState | null {
    return this.storage.getSnapshot();
  }

  subscribe(listener: () => void): () => void {
    return this.storage.subscribe(listener);
  }

  async addMemo(memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const state = await this.get();
    const id = uuidv4();
    const now = new Date();

    await this.set({
      ...state,
      memos: {
        ...state.memos,
        [id]: {
          ...memo,
          id,
          createdAt: now,
          updatedAt: now,
        },
      },
    });
  }

  async updateMemo(id: string, memo: Partial<Memo>): Promise<void> {
    const state = await this.get();
    const existingMemo = state.memos[id];

    if (!existingMemo) {
      throw new Error(`Memo with id ${id} not found`);
    }

    await this.set({
      ...state,
      memos: {
        ...state.memos,
        [id]: {
          ...existingMemo,
          ...memo,
          updatedAt: new Date(),
        },
      },
    });
  }

  async deleteMemo(id: string): Promise<void> {
    const state = await this.get();
    const remainingMemos = Object.fromEntries(Object.entries(state.memos).filter(([memoId]) => memoId !== id));

    await this.set({
      ...state,
      memos: remainingMemos,
    });
  }

  async setSearchQuery(query: string): Promise<void> {
    const state = await this.get();
    await this.set({
      ...state,
      searchQuery: query,
    });
  }
}

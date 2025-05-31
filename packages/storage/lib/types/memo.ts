import type { BaseStorageType } from '../base/types.js';

export interface Memo {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  position?: {
    x: number;
    y: number;
  };
  color?: string;
}

export interface MemoState {
  memos: Record<string, Memo>;
  searchQuery: string;
}

export type MemoStorageType = BaseStorageType<MemoState> & {
  addMemo: (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMemo: (id: string, memo: Partial<Memo>) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => Promise<void>;
};

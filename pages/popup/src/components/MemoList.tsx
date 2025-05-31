import { MemoStorage } from '@extension/storage';
import { cn } from '@extension/ui';
import { useCallback, useEffect, useState } from 'react';
import type { Memo } from '@extension/storage/lib/types/memo.js';
import { t } from '@extension/i18n';

const memoStorage = MemoStorage.getInstance();

interface MemoListProps {
  searchQuery: string;
}

export const MemoList = ({ searchQuery }: MemoListProps) => {
  const [memos, setMemos] = useState<Memo[]>([]);

  const loadMemos = useCallback(async () => {
    const state = await memoStorage.get();
    // 모든 메모를 가져와서 updatedAt 기준으로 내림차순 정렬
    const allMemos = Object.values(state.memos).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    setMemos(allMemos);
  }, []);

  useEffect(() => {
    loadMemos();
    const unsubscribe = memoStorage.subscribe(() => {
      void loadMemos();
    });
    return () => unsubscribe();
  }, [loadMemos]);

  const filteredMemos = memos.filter(memo => {
    const matchesSearch = searchQuery ? memo.content.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesSearch;
  });

  const handleDeleteMemo = useCallback(async (id: string) => {
    const state = await memoStorage.get();
    const remainingMemos = Object.fromEntries(Object.entries(state.memos).filter(([memoId]) => memoId !== id));
    await memoStorage.set({
      ...state,
      memos: remainingMemos,
    });
  }, []);

  if (filteredMemos.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-500">
        {searchQuery ? t('noMatchingMemos') : t('noMemos')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredMemos.map(memo => (
        <div
          key={memo.id}
          className={cn(
            'rounded-lg border p-4 shadow-sm transition-all hover:shadow-md',
            'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
          )}>
          <div className="flex items-start justify-between">
            <p className="text-gray-900 dark:text-gray-100">{memo.content}</p>
            <button
              onClick={() => handleDeleteMemo(memo.id)}
              className="ml-4 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
              {t('deleteMemo')}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {new Date(memo.updatedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

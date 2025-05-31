import '@src/Popup.css';
import { MemoForm } from './components/MemoForm';
import { MemoList } from './components/MemoList';
import { SearchBar } from './components/SearchBar';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { MemoStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useCallback, useEffect, useState } from 'react';

const memoStorage = MemoStorage.getInstance();

export const Popup = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    await memoStorage.setSearchQuery(query);
  }, []);

  useEffect(() => {
    const loadSearchQuery = async () => {
      const state = await memoStorage.get();
      setSearchQuery(state.searchQuery);
    };
    void loadSearchQuery();
  }, []);

  return (
    <div className="flex h-[600px] w-[750px] flex-col overflow-hidden bg-gray-50 p-4 dark:bg-gray-900">
      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Memo</h1>
        <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <MemoForm />
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <MemoList searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);

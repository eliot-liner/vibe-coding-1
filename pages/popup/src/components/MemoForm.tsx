import { MemoStorage } from '@extension/storage';
import { cn } from '@extension/ui';
import { useCallback, useState } from 'react';
import { t } from '@extension/i18n';

const memoStorage = MemoStorage.getInstance();

interface MemoFormProps {
  onSuccess?: () => void;
}

export const MemoForm = ({ onSuccess }: MemoFormProps) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!content.trim()) {
        setError(t('contentRequired'));
        return;
      }

      setIsSubmitting(true);

      try {
        await memoStorage.addMemo({
          content: content.trim(),
        });

        setContent('');
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('failedToAddMemo'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [content, onSuccess],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('memo')}
        </label>
        <textarea
          id="content"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white',
          )}
          placeholder={t('memoPlaceholder')}
        />
      </div>

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors',
          'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}>
        {isSubmitting ? t('addingMemo') : t('addMemo')}
      </button>
    </form>
  );
};

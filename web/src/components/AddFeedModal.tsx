import { useState, useRef } from 'react';
import { X, Rss, Loader2, Upload } from 'lucide-react';
import { useSubscribeFeed, useCreateFolder, useFolders, useImportOpml } from '../hooks/useFeeds';

interface AddFeedModalProps {
  onClose: () => void;
}

export default function AddFeedModal({ onClose }: AddFeedModalProps) {
  const [feedUrl, setFeedUrl] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [error, setError] = useState('');

  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; total: number; errors?: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: folders = [] } = useFolders();
  const subscribeMutation = useSubscribeFeed();
  const createFolderMutation = useCreateFolder();
  const importOpmlMutation = useImportOpml();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!feedUrl.trim()) {
      setError('Please enter a feed URL');
      return;
    }

    try {
      let folderId = selectedFolder || undefined;

      // Create new folder if specified
      if (showNewFolder && newFolderName.trim()) {
        const folder = await createFolderMutation.mutateAsync(newFolderName.trim());
        folderId = folder.id;
      }

      await subscribeMutation.mutateAsync({ url: feedUrl.trim(), folderId });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to subscribe to feed');
    }
  };

  const handleImportOpml = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setImportResult(null);

    try {
      const text = await file.text();
      const result = await importOpmlMutation.mutateAsync(text);
      setImportResult(result);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import OPML');
    }
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isLoading = subscribeMutation.isPending || createFolderMutation.isPending || importOpmlMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Rss size={20} className="text-accent-orange" />
            <h2 className="text-lg font-semibold text-content">Add Feed</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-content-tertiary hover:text-content-secondary rounded-lg hover:bg-surface-tertiary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Feed URL */}
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              Feed URL
            </label>
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://example.com/rss"
              className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-surface text-content focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-colors"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* Folder selection */}
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              Folder (optional)
            </label>
            {!showNewFolder ? (
              <div className="flex gap-2">
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="flex-1 px-3 py-2 border border-surface-border rounded-lg text-sm bg-surface text-content focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                  disabled={isLoading}
                >
                  <option value="">No folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewFolder(true)}
                  className="px-3 py-2 text-sm text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                >
                  New
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 px-3 py-2 border border-surface-border rounded-lg text-sm bg-surface text-content focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewFolder(false);
                    setNewFolderName('');
                  }}
                  className="px-3 py-2 text-sm text-content-secondary hover:bg-surface-tertiary rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 border-t border-surface-border" />
            <span className="text-xs text-content-tertiary">or</span>
            <div className="flex-1 border-t border-surface-border" />
          </div>

          {/* OPML Import */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".opml,.xml"
              onChange={handleImportOpml}
              className="hidden"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-surface-border text-content rounded-lg hover:bg-surface-secondary transition-colors disabled:opacity-50"
            >
              {importOpmlMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              Import OPML file
            </button>
          </div>

          {/* Import result */}
          {importResult && (
            <div className="text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg">
              Imported {importResult.imported} feed{importResult.imported !== 1 ? 's' : ''}
              {importResult.skipped > 0 && `, ${importResult.skipped} already subscribed`}
              {importResult.errors && importResult.errors.length > 0 && (
                <p className="mt-1 text-red-600 dark:text-red-400 text-xs">
                  {importResult.errors.length} failed: {importResult.errors[0]}
                  {importResult.errors.length > 1 && ` (+${importResult.errors.length - 1} more)`}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-content-secondary hover:bg-surface-tertiary rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              Subscribe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

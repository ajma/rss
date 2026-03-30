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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Rss size={20} className="text-accent-orange" />
            <h2 className="text-lg font-semibold text-gray-900">Add Feed</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Feed URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feed URL
            </label>
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://example.com/rss"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-colors"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* Folder selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Folder (optional)
            </label>
            {!showNewFolder ? (
              <div className="flex gap-2">
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewFolder(false);
                    setNewFolderName('');
                  }}
                  className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200" />
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
            <div className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg">
              Imported {importResult.imported} feed{importResult.imported !== 1 ? 's' : ''}
              {importResult.skipped > 0 && `, ${importResult.skipped} already subscribed`}
              {importResult.errors && importResult.errors.length > 0 && (
                <p className="mt-1 text-red-600 text-xs">
                  {importResult.errors.length} failed: {importResult.errors[0]}
                  {importResult.errors.length > 1 && ` (+${importResult.errors.length - 1} more)`}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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

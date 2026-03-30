import { useState, useRef, useMemo, useCallback } from 'react';
import IconSidebar from './IconSidebar';
import FeedSidebar from './FeedSidebar';
import ArticleList from './ArticleList';
import AddFeedModal from './AddFeedModal';
import KeyboardShortcutHelp from './KeyboardShortcutHelp';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { buildKeyboardShortcuts } from '../hooks/keyboardShortcutDefinitions';

export type ViewMode = 'all' | 'feed' | 'folder' | 'saved';
export type ArticleFilter = 'all' | 'unread' | 'saved' | 'read';

interface ViewState {
  mode: ViewMode;
  feedId?: string;
  folderId?: string;
  title: string;
}

export default function Layout() {
  const [view, setView] = useState<ViewState>({ mode: 'all', title: 'Newsfeed' });
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Article count is tracked so j/k can clamp properly
  const articleCountRef = useRef(0);
  const setArticleCount = useCallback((count: number) => {
    articleCountRef.current = count;
  }, []);

  // Refs for cross-component actions
  const searchInputRef = useRef<HTMLInputElement>(null);
  const refetchRef = useRef<(() => void) | null>(null);
  const markAllReadRef = useRef<(() => void) | null>(null);
  const openArticleExternalRef = useRef<((index: number) => void) | null>(null);
  const toggleArticleReadRef = useRef<((index: number) => void) | null>(null);
  const toggleArticleSavedRef = useRef<((index: number) => void) | null>(null);
  const navigateArticleRef = useRef<((direction: 'next' | 'prev') => void) | null>(null);
  const toggleExpandedRef = useRef<(() => void) | null>(null);
  const setArticleFilterRef = useRef<((filter: ArticleFilter) => void) | null>(null);

  const handleSelectFeed = (feedId: string, title: string) => {
    setView({ mode: 'feed', feedId, title });
    setFocusedIndex(-1);
  };

  const handleSelectFolder = (folderId: string, title: string) => {
    setView({ mode: 'folder', folderId, title });
    setFocusedIndex(-1);
  };

  const handleSelectAll = () => {
    setView({ mode: 'all', title: 'Newsfeed' });
    setFocusedIndex(-1);
  };

  const handleSelectSaved = () => {
    setView({ mode: 'saved', title: 'Saved Articles' });
    setFocusedIndex(-1);
  };

  // ─── Keyboard shortcuts ───────────────────────────────────────────
  const shortcuts = useMemo(
    () =>
      buildKeyboardShortcuts({
        setShowAddFeed,
        refetch: () => refetchRef.current?.(),
        focusSearch: () => searchInputRef.current?.focus(),
        toggleHelp: () => setShowHelp((prev) => !prev),
        closeDialogs: () => {
          setShowAddFeed(false);
          setShowHelp(false);
        },
        nextArticle: () => navigateArticleRef.current?.('next'),
        prevArticle: () => navigateArticleRef.current?.('prev'),
        toggleArticle: () => toggleExpandedRef.current?.(),
        openArticleExternal: () => {
          if (focusedIndex >= 0) openArticleExternalRef.current?.(focusedIndex);
        },
        toggleArticleRead: () => {
          if (focusedIndex >= 0) toggleArticleReadRef.current?.(focusedIndex);
        },
        toggleArticleSaved: () => {
          if (focusedIndex >= 0) toggleArticleSavedRef.current?.(focusedIndex);
        },
        markAllRead: () => markAllReadRef.current?.(),
        toggleSidebar: () => setSidebarCollapsed((prev) => !prev),
        setArticleFilter: (filter) => setArticleFilterRef.current?.(filter),
      }),
    [focusedIndex],
  );

  useKeyboardShortcuts(shortcuts);

  // Deduplicate shortcuts for help modal (remove duplicates with same label+group)
  const uniqueShortcuts = useMemo(() => {
    const seen = new Set<string>();
    return shortcuts.filter((s) => {
      const key = `${s.group}::${s.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [shortcuts]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary">
      {/* Narrow icon sidebar */}
      <IconSidebar
        onAddFeed={() => setShowAddFeed(true)}
        onSelectSaved={handleSelectSaved}
        onSelectAll={handleSelectAll}
        activeView={view.mode}
      />

      {/* Feed tree sidebar */}
      {!sidebarCollapsed && (
        <FeedSidebar
          onSelectFeed={handleSelectFeed}
          onSelectFolder={handleSelectFolder}
          onSelectAll={handleSelectAll}
          activeView={view}
          onCollapse={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <ArticleList
          view={view}
          sidebarCollapsed={sidebarCollapsed}
          onExpandSidebar={() => setSidebarCollapsed(false)}
          focusedIndex={focusedIndex}
          searchInputRef={searchInputRef}
          refetchRef={refetchRef}
          markAllReadRef={markAllReadRef}
          openArticleExternalRef={openArticleExternalRef}
          toggleArticleReadRef={toggleArticleReadRef}
          toggleArticleSavedRef={toggleArticleSavedRef}
          navigateArticleRef={navigateArticleRef}
          toggleExpandedRef={toggleExpandedRef}
          setArticleFilterRef={setArticleFilterRef}
          onArticleCountChange={setArticleCount}
          onFocusArticle={setFocusedIndex}
        />
      </main>

      {/* Add feed modal */}
      {showAddFeed && <AddFeedModal onClose={() => setShowAddFeed(false)} />}

      {/* Keyboard help modal */}
      {showHelp && <KeyboardShortcutHelp shortcuts={uniqueShortcuts} onClose={() => setShowHelp(false)} />}
    </div>
  );
}

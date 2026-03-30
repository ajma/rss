import { useState, useMemo, useEffect, type MutableRefObject, type RefObject } from 'react';
import {
  Search,
  CheckCheck,
  Undo2,
  ChevronDown,
  PanelLeftOpen,
  MoreHorizontal,
} from 'lucide-react';
import { useArticles, useMarkAllRead, useMarkArticleRead, useToggleArticleSaved } from '../hooks/useArticles';
import ArticleRow from './ArticleRow';
import type { ViewMode, ArticleFilter } from './Layout';

interface ArticleListProps {
  view: { mode: ViewMode; feedId?: string; folderId?: string; title: string };
  sidebarCollapsed: boolean;
  onExpandSidebar: () => void;
  focusedIndex: number;
  searchInputRef: RefObject<HTMLInputElement | null>;
  refetchRef: MutableRefObject<(() => void) | null>;
  markAllReadRef: MutableRefObject<(() => void) | null>;
  openArticleExternalRef: MutableRefObject<((index: number) => void) | null>;
  toggleArticleReadRef: MutableRefObject<((index: number) => void) | null>;
  toggleArticleSavedRef: MutableRefObject<((index: number) => void) | null>;
  navigateArticleRef: MutableRefObject<((direction: 'next' | 'prev') => void) | null>;
  toggleExpandedRef: MutableRefObject<(() => void) | null>;
  setArticleFilterRef: MutableRefObject<((filter: ArticleFilter) => void) | null>;
  onArticleCountChange: (count: number) => void;
  onFocusArticle: (index: number) => void;
}

export default function ArticleList({
  view,
  sidebarCollapsed,
  onExpandSidebar,
  focusedIndex,
  searchInputRef,
  refetchRef,
  markAllReadRef,
  openArticleExternalRef,
  toggleArticleReadRef,
  toggleArticleSavedRef,
  navigateArticleRef,
  toggleExpandedRef,
  setArticleFilterRef,
  onArticleCountChange,
  onFocusArticle,
}: ArticleListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [articleFilter, setArticleFilter] = useState<ArticleFilter>('all');
  const [expandedIndex, setExpandedIndex] = useState(-1);

  // Build query params based on view mode
  const queryParams = useMemo(() => {
    const params: any = { limit: 100 };
    if (view.mode === 'feed' && view.feedId) params.feedId = view.feedId;
    if (view.mode === 'folder' && view.folderId) params.folderId = view.folderId;
    if (view.mode === 'saved' || articleFilter === 'saved') params.saved = true;
    if (articleFilter === 'unread') params.readFilter = 'unread';
    if (articleFilter === 'read') params.readFilter = 'read';
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return params;
  }, [view, searchQuery, articleFilter]);

  const { data, isLoading, refetch } = useArticles(queryParams);
  const markAllReadMutation = useMarkAllRead();
  const markReadMutation = useMarkArticleRead();
  const toggleSavedMutation = useToggleArticleSaved();
  const articles = data?.articles || [];

  // Report article count to parent for keyboard navigation bounds
  useEffect(() => {
    onArticleCountChange(articles.length);
  }, [articles.length, onArticleCountChange]);

  const handleMarkAllRead = () => {
    const params: any = {};
    if (view.mode === 'feed' && view.feedId) params.feedId = view.feedId;
    if (view.mode === 'folder' && view.folderId) params.folderId = view.folderId;
    markAllReadMutation.mutate(params);
  };

  // ─── Wire up refs for keyboard shortcut callbacks ─────────────────
  useEffect(() => {
    refetchRef.current = () => refetch();
    markAllReadRef.current = handleMarkAllRead;
    openArticleExternalRef.current = (index: number) => {
      const article = articles[index];
      if (article?.url) {
        window.open(article.url, '_blank', 'noopener,noreferrer');
      }
    };
    toggleArticleReadRef.current = (index: number) => {
      const article = articles[index];
      if (article) {
        markReadMutation.mutate({ id: article.id, isRead: !article.isRead });
      }
    };
    toggleArticleSavedRef.current = (index: number) => {
      const article = articles[index];
      if (article) {
        toggleSavedMutation.mutate({ id: article.id, isSaved: !article.isSaved });
      }
    };
    setArticleFilterRef.current = (filter: ArticleFilter) => {
      setArticleFilter(filter);
    };
    toggleExpandedRef.current = () => {
      setExpandedIndex((prev) => (prev >= 0 ? -1 : focusedIndex));
    };
    navigateArticleRef.current = (direction: 'next' | 'prev') => {
      const max = articles.length - 1;
      if (max < 0) return;
      const newIndex =
        direction === 'next'
          ? Math.min(focusedIndex + 1, max)
          : Math.max(focusedIndex <= 0 ? 0 : focusedIndex - 1, 0);
      if (newIndex === focusedIndex && focusedIndex >= 0) return;
      onFocusArticle(newIndex);
      setExpandedIndex(newIndex);
    };
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        {/* Expand sidebar button (shown when collapsed) */}
        {sidebarCollapsed && (
          <button
            onClick={onExpandSidebar}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {/* Title */}
        <div className="flex items-center gap-1">
          <h1 className="text-lg font-semibold text-gray-900">{view.title}</h1>
          <ChevronDown size={16} className="text-gray-400" />
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-1 ml-2">
          <select
            value={articleFilter}
            onChange={(e) => setArticleFilter(e.target.value as ArticleFilter)}
            className="text-sm bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
          >
            <option value="all">All articles</option>
            <option value="unread">Unread only</option>
            <option value="read">Read only</option>
            <option value="saved">Saved</option>
          </select>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search in articles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 ml-2">
          <button
            onClick={() => refetch()}
            title="Refresh"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={handleMarkAllRead}
            title="Mark all as read"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CheckCheck size={16} />
          </button>
          <button
            title="More options"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent-blue border-t-transparent" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search size={40} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">No articles found</p>
            <p className="text-sm mt-1">
              {view.mode === 'all'
                ? 'Subscribe to feeds to see articles here'
                : 'No articles match your current filter'}
            </p>
          </div>
        ) : (
          articles.map((article, index) => (
            <ArticleRow
              key={article.id}
              article={article}
              isExpanded={index === expandedIndex}
              isFocused={index === focusedIndex}
              onToggle={() => {
                onFocusArticle(index);
                setExpandedIndex(expandedIndex === index ? -1 : index);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

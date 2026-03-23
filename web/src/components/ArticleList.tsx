import { useState, useMemo } from 'react';
import {
  Search,
  CheckCheck,
  ChevronsDownUp,
  ChevronsUpDown,
  Undo2,
  ChevronDown,
  PanelLeftOpen,
  MoreHorizontal,
} from 'lucide-react';
import { useArticles, useMarkAllRead } from '../hooks/useArticles';
import ArticleRow from './ArticleRow';
import type { ViewMode } from './Layout';

interface ArticleListProps {
  view: { mode: ViewMode; feedId?: string; folderId?: string; title: string };
  sidebarCollapsed: boolean;
  onExpandSidebar: () => void;
}

export default function ArticleList({ view, sidebarCollapsed, onExpandSidebar }: ArticleListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // Build query params based on view mode
  const queryParams = useMemo(() => {
    const params: any = { limit: 100 };
    if (view.mode === 'feed' && view.feedId) params.feedId = view.feedId;
    if (view.mode === 'folder' && view.folderId) params.folderId = view.folderId;
    if (view.mode === 'saved') params.saved = true;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return params;
  }, [view, searchQuery]);

  const { data, isLoading, refetch } = useArticles(queryParams);
  const markAllReadMutation = useMarkAllRead();
  const articles = data?.articles || [];

  const toggleArticle = (id: string) => {
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedArticles(new Set(articles.map((a) => a.id)));
    setAllExpanded(true);
  };

  const collapseAll = () => {
    setExpandedArticles(new Set());
    setAllExpanded(false);
  };

  const handleMarkAllRead = () => {
    const params: any = {};
    if (view.mode === 'feed' && view.feedId) params.feedId = view.feedId;
    if (view.mode === 'folder' && view.folderId) params.folderId = view.folderId;
    markAllReadMutation.mutate(params);
  };

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
          <select className="text-sm bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue/50">
            <option>All articles</option>
            <option>Unread only</option>
            <option>Read only</option>
          </select>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
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
            onClick={allExpanded ? collapseAll : expandAll}
            title={allExpanded ? 'Collapse all' : 'Expand all'}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {allExpanded ? <ChevronsDownUp size={16} /> : <ChevronsUpDown size={16} />}
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
          articles.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              isExpanded={expandedArticles.has(article.id)}
              onToggle={() => toggleArticle(article.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

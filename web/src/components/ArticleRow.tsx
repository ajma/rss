import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, MoreHorizontal, Loader2 } from 'lucide-react';
import { useArticle, useMarkArticleRead, useToggleArticleSaved } from '../hooks/useArticles';
import type { Article } from '../api/articles';

interface ArticleRowProps {
  article: Article;
  isExpanded: boolean;
  isFocused: boolean;
  onToggle: () => void;
}

/**
 * Formats a date string into a human-readable "time ago" string.
 */
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo`;
}

export default function ArticleRow({ article, isExpanded, isFocused, onToggle }: ArticleRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showContent, setShowContent] = useState(false);
  const markReadMutation = useMarkArticleRead();
  const toggleSavedMutation = useToggleArticleSaved();

  // Fetch full content when expanded
  const { data: fullArticle, isLoading: isLoadingContent } = useArticle(isExpanded ? article.id : null);

  useEffect(() => {
    if (isExpanded) {
      // Small delay for animation
      requestAnimationFrame(() => setShowContent(true));
      // Mark as read when expanded
      if (!article.isRead) {
        markReadMutation.mutate({ id: article.id, isRead: true });
      }
      // Scroll expanded article to the top
      if (rowRef.current) {
        rowRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    } else {
      setShowContent(false);
    }
  }, [isExpanded]);

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markReadMutation.mutate({ id: article.id, isRead: !article.isRead });
  };

  const handleToggleSaved = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavedMutation.mutate({ id: article.id, isSaved: !article.isSaved });
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      ref={rowRef}
      className={`border-b border-gray-100 transition-colors ${
        isFocused || isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Collapsed row (using div to avoid nested buttons) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="flex items-center w-full text-left px-4 py-2.5 gap-3 group cursor-pointer select-none focus:outline-none"
      >
        {/* Unread indicator */}
        <div className="w-4 shrink-0 flex justify-center">
          <button
            onClick={handleToggleRead}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              article.isRead
                ? 'bg-transparent hover:bg-gray-300 border border-transparent hover:border-gray-400'
                : 'bg-unread'
            }`}
            title={article.isRead ? 'Mark as unread' : 'Mark as read'}
          />
        </div>

        {/* Feed favicon + name */}
        <div className="flex items-center gap-2 w-32 shrink-0">
          {article.feedFaviconUrl ? (
            <img
              src={article.feedFaviconUrl}
              alt=""
              className="w-4 h-4 rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-4 h-4 rounded bg-accent-orange/20 flex items-center justify-center">
              <span className="text-[8px] text-accent-orange font-bold">
                {article.feedTitle.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-500 truncate">{article.feedTitle}</span>
        </div>

        {/* Article title + snippet */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <span
            className={`truncate ${
              article.isRead
                ? 'text-gray-500 font-normal'
                : 'text-gray-900 font-semibold'
            }`}
          >
            {article.title}
          </span>
          <span className="text-sm text-gray-400 truncate hidden sm:inline">
            {article.snippet}
          </span>
        </div>

        {/* Time ago */}
        <span className="text-xs text-gray-400 shrink-0 ml-2">
          {timeAgo(article.publishedAt)}
        </span>

        {/* Row actions (visible on hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handleToggleSaved}
            title={article.isSaved ? 'Unsave' : 'Save'}
            className="p-1 text-gray-400 hover:text-accent-blue rounded transition-colors"
          >
            {article.isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
          <button
            onClick={handleOpenExternal}
            title="Open in new tab"
            className="p-1 text-gray-400 hover:text-accent-blue rounded transition-colors"
          >
            <ExternalLink size={14} />
          </button>
          <button
            title="More"
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div
          className={`px-4 pb-4 pl-[3.25rem] transition-all duration-300 ${
            showContent ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'
          } overflow-hidden`}
        >
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            {/* Article header */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {article.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{article.feedTitle}</span>
                {article.author && (
                  <>
                    <span>•</span>
                    <span>{article.author}</span>
                  </>
                )}
                {article.publishedAt && (
                  <>
                    <span>•</span>
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </>
                )}
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-accent-blue hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    Original
                  </a>
                )}
              </div>
            </div>

            {/* Article body */}
            {isLoadingContent ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 size={24} className="animate-spin text-accent-blue" />
                <span className="text-sm text-gray-400">Fetching full article…</span>
                <div className="w-full mt-2 space-y-3">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-4/6" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ) : (
              <div
                className="article-content prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: fullArticle?.content || article.snippet || '',
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

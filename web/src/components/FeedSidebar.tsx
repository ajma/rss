import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Rss,
  FolderOpen,
  Settings,
  RefreshCw,
  PanelLeftClose,
} from 'lucide-react';
import { useSubscriptions, useFolders } from '../hooks/useFeeds';
import type { ViewMode } from './Layout';

interface FeedSidebarProps {
  onSelectFeed: (feedId: string, title: string) => void;
  onSelectFolder: (folderId: string, title: string) => void;
  onSelectAll: () => void;
  activeView: { mode: ViewMode; feedId?: string; folderId?: string };
  onCollapse: () => void;
}

export default function FeedSidebar({
  onSelectFeed,
  onSelectFolder,
  onSelectAll,
  activeView,
  onCollapse,
}: FeedSidebarProps) {
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: folders = [] } = useFolders();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(folderId) ? next.delete(folderId) : next.add(folderId);
      return next;
    });
  };

  // Total unread across all subscriptions
  const totalUnread = subscriptions.reduce((sum, sub) => sum + sub.unreadCount, 0);

  // Feeds not in any folder
  const rootFeeds = subscriptions.filter((sub) => !sub.folderId);

  return (
    <div className="flex flex-col w-60 bg-sidebar shrink-0 text-sm border-r border-sidebar-dark/50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-sidebar-dark/50">
        <h2 className="text-sidebar-text-active font-semibold text-base">Feeds</h2>
        <div className="flex items-center gap-1">
          <button
            title="Settings"
            className="p-1 text-sidebar-text hover:text-white rounded transition-colors"
          >
            <Settings size={14} />
          </button>
          <button
            title="Refresh"
            className="p-1 text-sidebar-text hover:text-white rounded transition-colors"
          >
            <RefreshCw size={14} />
          </button>
          <button
            title="Collapse sidebar"
            onClick={onCollapse}
            className="p-1 text-sidebar-text hover:text-white rounded transition-colors"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
      </div>

      {/* Feed tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Newsfeed (all) */}
        <button
          onClick={onSelectAll}
          className={`flex items-center w-full px-3 py-1.5 gap-2 transition-colors ${
            activeView.mode === 'all'
              ? 'bg-sidebar-active text-icon-active'
              : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
          }`}
        >
          <Rss size={15} className="shrink-0 text-icon-active" />
          <span className="truncate flex-1 text-left font-medium">Newsfeed</span>
          {totalUnread > 0 && (
            <span className="text-xs text-sidebar-text ml-auto">
              {totalUnread > 999 ? '999+' : totalUnread}
            </span>
          )}
        </button>

        {/* Root-level feeds (not in any folder) */}
        {rootFeeds.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onSelectFeed(sub.feedId, sub.title)}
            className={`flex items-center w-full px-3 py-1.5 pl-7 gap-2 transition-colors ${
              activeView.mode === 'feed' && activeView.feedId === sub.feedId
                ? 'bg-sidebar-active text-sidebar-text-active'
                : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
            }`}
          >
            {sub.faviconUrl ? (
              <img
                src={sub.faviconUrl}
                alt=""
                className="w-4 h-4 rounded shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Rss size={14} className="shrink-0 text-accent-orange" />
            )}
            <span className="truncate flex-1 text-left">{sub.title}</span>
            {sub.unreadCount > 0 && (
              <span className="text-xs text-sidebar-text">{sub.unreadCount}</span>
            )}
          </button>
        ))}

        {/* Folders */}
        {folders.map((folder) => (
          <div key={folder.id}>
            {/* Folder header */}
            <div className="flex items-center">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="p-1 ml-1 text-sidebar-text hover:text-white"
              >
                {expandedFolders.has(folder.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <button
                onClick={() => onSelectFolder(folder.id, folder.name)}
                className={`flex items-center flex-1 py-1.5 pr-3 gap-2 transition-colors ${
                  activeView.mode === 'folder' && activeView.folderId === folder.id
                    ? 'text-sidebar-text-active'
                    : 'text-sidebar-text hover:text-sidebar-text-active'
                }`}
              >
                <FolderOpen size={14} className="shrink-0 text-accent-orange" />
                <span className="truncate flex-1 text-left">{folder.name}</span>
                {folder.unreadCount > 0 && (
                  <span className="text-xs text-sidebar-text">{folder.unreadCount}</span>
                )}
              </button>
            </div>

            {/* Folder feeds */}
            {expandedFolders.has(folder.id) &&
              folder.feeds.map((feed) => (
                <button
                  key={feed.id}
                  onClick={() => onSelectFeed(feed.feedId, feed.title)}
                  className={`flex items-center w-full px-3 py-1.5 pl-10 gap-2 transition-colors ${
                    activeView.mode === 'feed' && activeView.feedId === feed.feedId
                      ? 'bg-sidebar-active text-sidebar-text-active'
                      : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
                  }`}
                >
                  {feed.faviconUrl ? (
                    <img
                      src={feed.faviconUrl}
                      alt=""
                      className="w-4 h-4 rounded shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Rss size={14} className="shrink-0 text-accent-orange" />
                  )}
                  <span className="truncate flex-1 text-left">{feed.title}</span>
                  {feed.unreadCount > 0 && (
                    <span className="text-xs text-sidebar-text">{feed.unreadCount}</span>
                  )}
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

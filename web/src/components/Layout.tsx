import { useState } from 'react';
import IconSidebar from './IconSidebar';
import FeedSidebar from './FeedSidebar';
import ArticleList from './ArticleList';
import AddFeedModal from './AddFeedModal';

export type ViewMode = 'all' | 'feed' | 'folder' | 'saved';

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

  const handleSelectFeed = (feedId: string, title: string) => {
    setView({ mode: 'feed', feedId, title });
  };

  const handleSelectFolder = (folderId: string, title: string) => {
    setView({ mode: 'folder', folderId, title });
  };

  const handleSelectAll = () => {
    setView({ mode: 'all', title: 'Newsfeed' });
  };

  const handleSelectSaved = () => {
    setView({ mode: 'saved', title: 'Saved Articles' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
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
        />
      </main>

      {/* Add feed modal */}
      {showAddFeed && <AddFeedModal onClose={() => setShowAddFeed(false)} />}
    </div>
  );
}

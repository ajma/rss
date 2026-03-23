import {
  Rss,
  Bookmark,
  Search,
  PlusCircle,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { ViewMode } from './Layout';

interface IconSidebarProps {
  onAddFeed: () => void;
  onSelectSaved: () => void;
  onSelectAll: () => void;
  activeView: ViewMode;
}

export default function IconSidebar({
  onAddFeed,
  onSelectSaved,
  onSelectAll,
  activeView,
}: IconSidebarProps) {
  const { logout } = useAuth();

  const iconBtn = (
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
    isActive = false
  ) => (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 ${
        isActive
          ? 'bg-icon-active/20 text-icon-active'
          : 'text-sidebar-text hover:text-white hover:bg-sidebar-hover'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col items-center w-14 bg-icon-bg py-3 gap-1 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-orange text-white font-bold text-sm mb-4">
        RS
      </div>

      {/* Main nav */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {iconBtn(
          <Rss size={20} />,
          'Feeds',
          onSelectAll,
          activeView === 'all' || activeView === 'feed' || activeView === 'folder'
        )}
        {iconBtn(
          <Bookmark size={20} />,
          'Saved',
          onSelectSaved,
          activeView === 'saved'
        )}
        {iconBtn(<Search size={20} />, 'Search', () => {
          // Search is handled in the toolbar
        })}
        {iconBtn(<PlusCircle size={20} />, 'Add Feed', onAddFeed)}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-1">
        {iconBtn(<Settings size={20} />, 'Settings', () => {})}
        {iconBtn(<LogOut size={20} />, 'Logout', logout)}
      </div>
    </div>
  );
}

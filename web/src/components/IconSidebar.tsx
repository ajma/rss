import {
  Rss,
  Bookmark,
  Search,
  PlusCircle,
  Sun,
  Moon,
  Monitor,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
  const { preference, setPreference } = useTheme();

  const cycleTheme = () => {
    const next = preference === 'light' ? 'dark' : preference === 'dark' ? 'system' : 'light';
    setPreference(next);
  };

  const themeIcon =
    preference === 'light' ? <Sun size={20} /> :
    preference === 'dark' ? <Moon size={20} /> :
    <Monitor size={20} />;

  const themeLabel =
    preference === 'light' ? 'Theme: Light' :
    preference === 'dark' ? 'Theme: Dark' :
    'Theme: System';

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
          : 'text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col items-center w-14 bg-sidebar py-3 gap-1 shrink-0 border-r border-sidebar-border">
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
        {iconBtn(themeIcon, themeLabel, cycleTheme)}
        {iconBtn(<LogOut size={20} />, 'Logout', logout)}
      </div>
    </div>
  );
}

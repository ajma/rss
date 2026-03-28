import type { KeyboardShortcut } from './useKeyboardShortcuts';

/**
 * Dependencies injected from Layout so shortcut definitions stay decoupled.
 */
export interface ShortcutActions {
  setShowAddFeed: (show: boolean) => void;
  refetch: () => void;
  focusSearch: () => void;
  toggleHelp: () => void;
  closeDialogs: () => void;
  nextArticle: () => void;
  prevArticle: () => void;
  toggleArticle: () => void;
  openArticleExternal: () => void;
  toggleArticleRead: () => void;
  toggleArticleSaved: () => void;
  markAllRead: () => void;
  toggleSidebar: () => void;
}

/**
 * Returns the full list of keyboard shortcut definitions.
 *
 * To add a new shortcut, simply append an entry to the returned array.
 */
export function buildKeyboardShortcuts(actions: ShortcutActions): KeyboardShortcut[] {
  return [
    // ── Global ──
    {
      key: 'a',
      group: 'Global',
      label: 'Add feed',
      handler: () => actions.setShowAddFeed(true),
    },
    {
      key: 'r',
      group: 'Global',
      label: 'Refresh feed',
      handler: actions.refetch,
    },
    {
      key: '/',
      group: 'Global',
      label: 'Focus search',
      handler: actions.focusSearch,
    },
    {
      key: 'h',
      group: 'Global',
      label: 'Open keyboard help',
      handler: actions.toggleHelp,
    },
    {
      key: '?',
      shift: true,
      group: 'Global',
      label: 'Open keyboard help',
      handler: actions.toggleHelp,
    },
    {
      key: 'Escape',
      group: 'Global',
      label: 'Close dialog',
      handler: actions.closeDialogs,
    },

    // ── Article navigation ──
    {
      key: 'j',
      group: 'Article navigation',
      label: 'Next article',
      handler: actions.nextArticle,
    },
    {
      key: ' ',
      group: 'Article navigation',
      label: 'Next article',
      handler: actions.nextArticle,
    },
    {
      key: 'k',
      group: 'Article navigation',
      label: 'Previous article',
      handler: actions.prevArticle,
    },
    {
      key: ' ',
      shift: true,
      group: 'Article navigation',
      label: 'Previous article',
      handler: actions.prevArticle,
    },
    {
      key: 'o',
      group: 'Article navigation',
      label: 'Open / Close article',
      handler: actions.toggleArticle,
    },
    {
      key: 'Enter',
      group: 'Article navigation',
      label: 'Open / Close article',
      handler: actions.toggleArticle,
    },
    {
      key: 'v',
      group: 'Article navigation',
      label: 'Open in new tab',
      handler: actions.openArticleExternal,
    },

    // ── Article manipulation ──
    {
      key: 'm',
      group: 'Article manipulation',
      label: 'Mark as read / unread',
      handler: actions.toggleArticleRead,
    },
    {
      key: 's',
      group: 'Article manipulation',
      label: 'Toggle saved',
      handler: actions.toggleArticleSaved,
    },
    {
      key: 'A',
      shift: true,
      group: 'Article manipulation',
      label: 'Mark all as read',
      handler: actions.markAllRead,
    },

    // ── Sidebar ──
    {
      key: 'd',
      group: 'Sidebar',
      label: 'Toggle sidebar',
      handler: actions.toggleSidebar,
    },
  ];
}

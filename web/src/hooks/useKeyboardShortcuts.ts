import { useEffect } from 'react';

export interface KeyboardShortcut {
  /** The key to match (e.g. 'j', '/', '?', 'Enter', 'Escape') — use KeyboardEvent.key values */
  key: string;
  /** Require Ctrl (or Cmd on Mac) */
  ctrl?: boolean;
  /** Require Shift */
  shift?: boolean;
  /** Require Alt */
  alt?: boolean;
  /** Category for grouping in help modal */
  group: string;
  /** Human-readable description */
  label: string;
  /** Handler to invoke when the shortcut fires */
  handler: () => void;
}

/** Tags whose focus should suppress keyboard shortcuts */
const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Returns true if the event target is an element where the user is typing text,
 * in which case global shortcuts should be suppressed.
 */
export function isInputFocused(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  if (INPUT_TAGS.has(target.tagName)) return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Returns true if the given KeyboardEvent matches the shortcut definition.
 */
export function matchesShortcut(e: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  // Normalise key comparison — event.key for letters is case-sensitive,
  // so when shift is NOT required we compare lowercase.
  const eventKey = shortcut.shift ? e.key : e.key.toLowerCase();
  const shortcutKey = shortcut.shift ? shortcut.key : shortcut.key.toLowerCase();

  if (eventKey !== shortcutKey) return false;
  if (!!shortcut.ctrl !== (e.ctrlKey || e.metaKey)) return false;
  if (!!shortcut.shift !== e.shiftKey) return false;
  if (!!shortcut.alt !== e.altKey) return false;
  return true;
}

/**
 * Registers a global keydown listener that dispatches to the matching shortcut handler.
 * Shortcuts are suppressed when focus is inside text inputs.
 *
 * @example
 * ```ts
 * useKeyboardShortcuts([
 *   { key: 'a', group: 'Global', label: 'Add feed', handler: () => setShowAddFeed(true) },
 *   { key: 'j', group: 'Navigation', label: 'Next article', handler: () => focusNext() },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused(e)) return;

      for (const shortcut of shortcuts) {
        if (matchesShortcut(e, shortcut)) {
          e.preventDefault();
          console.log(`[Keyboard Shortcut]: ${shortcut.label} (${shortcut.key})`);
          shortcut.handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

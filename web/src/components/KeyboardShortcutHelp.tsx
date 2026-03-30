import { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutHelpProps {
  shortcuts: KeyboardShortcut[];
  onClose: () => void;
}

/** Map shifted-number symbols back to their digit for display */
const SHIFT_SYMBOL_TO_DIGIT: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', '$': '4',
  '%': '5', '^': '6', '&': '7', '*': '8',
  '(': '9', ')': '0',
};

/** Human-readable label for a shortcut's key combo */
function keyLabel(s: KeyboardShortcut): string {
  const parts: string[] = [];
  if (s.ctrl) parts.push('Ctrl');
  if (s.alt) parts.push('Alt');
  if (s.shift) parts.push('Shift');
  // Prettify certain key names
  const keyName =
    s.key === ' '
      ? 'Space'
      : s.key === 'Enter'
        ? 'Enter'
        : s.key === 'Escape'
          ? 'Esc'
          : SHIFT_SYMBOL_TO_DIGIT[s.key] ?? s.key.toLowerCase();
  parts.push(keyName);
  return parts.join(' + ');
}

export default function KeyboardShortcutHelp({ shortcuts, onClose }: KeyboardShortcutHelpProps) {
  // Group shortcuts by their group field, preserving insertion order
  const grouped = useMemo(() => {
    const map = new Map<string, KeyboardShortcut[]>();
    for (const s of shortcuts) {
      if (!map.has(s.group)) map.set(s.group, []);
      map.get(s.group)!.push(s);
    }
    return map;
  }, [shortcuts]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from(grouped.entries()).map(([group, items]) => (
              <div key={group}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {group}
                </h3>
                <div className="space-y-2">
                  {items.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{s.label}</span>
                      <kbd className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-xs font-mono text-gray-600 min-w-[2rem] justify-center">
                        {keyLabel(s)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-center text-xs text-gray-400">
          Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 font-mono">H</kbd> or{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 font-mono">?</kbd> to toggle this
          help
        </div>
      </div>
    </div>
  );
}

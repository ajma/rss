import { describe, it, expect, vi } from 'vitest';
import { matchesShortcut, isInputFocused, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

/** Create a minimal KeyboardEvent-like object for testing (no DOM required) */
function fakeEvent(overrides: Partial<KeyboardEvent> & { key: string }): KeyboardEvent {
  return {
    key: overrides.key,
    ctrlKey: overrides.ctrlKey ?? false,
    metaKey: overrides.metaKey ?? false,
    shiftKey: overrides.shiftKey ?? false,
    altKey: overrides.altKey ?? false,
    target: overrides.target ?? { tagName: 'DIV', isContentEditable: false },
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent;
}

/** Create a fake target element without needing the DOM */
function fakeTarget(tagName: string, contentEditable = false) {
  return { tagName: tagName.toUpperCase(), isContentEditable: contentEditable } as unknown as HTMLElement;
}

function shortcut(overrides: Partial<KeyboardShortcut> & { key: string }): KeyboardShortcut {
  return {
    key: overrides.key,
    ctrl: overrides.ctrl ?? false,
    shift: overrides.shift ?? false,
    alt: overrides.alt ?? false,
    group: overrides.group ?? 'Test',
    label: overrides.label ?? 'test shortcut',
    handler: overrides.handler ?? vi.fn(),
  };
}

// ────────────────────────────────────────────────────────────────────
describe('matchesShortcut', () => {
  it('matches a simple key', () => {
    expect(matchesShortcut(fakeEvent({ key: 'j' }), shortcut({ key: 'j' }))).toBe(true);
  });

  it('is case-insensitive for non-shift keys', () => {
    expect(matchesShortcut(fakeEvent({ key: 'J' }), shortcut({ key: 'j' }))).toBe(true);
  });

  it('does not match a different key', () => {
    expect(matchesShortcut(fakeEvent({ key: 'k' }), shortcut({ key: 'j' }))).toBe(false);
  });

  it('matches Shift + key', () => {
    const e = fakeEvent({ key: 'A', shiftKey: true });
    const s = shortcut({ key: 'A', shift: true });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('does NOT match plain key when Shift shortcut is defined', () => {
    const e = fakeEvent({ key: 'a', shiftKey: false });
    const s = shortcut({ key: 'A', shift: true });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('does NOT match Shift+key when plain shortcut is defined', () => {
    const e = fakeEvent({ key: 'A', shiftKey: true });
    const s = shortcut({ key: 'a' });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('matches Ctrl + key', () => {
    const e = fakeEvent({ key: 's', ctrlKey: true });
    const s = shortcut({ key: 's', ctrl: true });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('matches Meta (Cmd) as Ctrl', () => {
    const e = fakeEvent({ key: 's', metaKey: true });
    const s = shortcut({ key: 's', ctrl: true });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('does NOT match Ctrl+key when plain shortcut is defined', () => {
    const e = fakeEvent({ key: 's', ctrlKey: true });
    const s = shortcut({ key: 's' });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('matches Alt + key', () => {
    const e = fakeEvent({ key: 'p', altKey: true });
    const s = shortcut({ key: 'p', alt: true });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('matches special keys like Enter', () => {
    expect(matchesShortcut(fakeEvent({ key: 'Enter' }), shortcut({ key: 'Enter' }))).toBe(true);
  });

  it('matches Escape key', () => {
    expect(matchesShortcut(fakeEvent({ key: 'Escape' }), shortcut({ key: 'Escape' }))).toBe(true);
  });

  it('matches Space key', () => {
    expect(matchesShortcut(fakeEvent({ key: ' ' }), shortcut({ key: ' ' }))).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────
describe('isInputFocused', () => {
  it('returns true when target is an INPUT', () => {
    expect(isInputFocused(fakeEvent({ key: 'j', target: fakeTarget('input') as any }))).toBe(true);
  });

  it('returns true when target is a TEXTAREA', () => {
    expect(isInputFocused(fakeEvent({ key: 'j', target: fakeTarget('textarea') as any }))).toBe(true);
  });

  it('returns true when target is a SELECT', () => {
    expect(isInputFocused(fakeEvent({ key: 'j', target: fakeTarget('select') as any }))).toBe(true);
  });

  it('returns true when target is contentEditable', () => {
    expect(isInputFocused(fakeEvent({ key: 'j', target: fakeTarget('div', true) as any }))).toBe(true);
  });

  it('returns false for a regular div', () => {
    expect(isInputFocused(fakeEvent({ key: 'j', target: fakeTarget('div') as any }))).toBe(false);
  });

  it('returns false when target is null', () => {
    expect(isInputFocused(fakeEvent({ key: 'j', target: null as any }))).toBe(false);
  });
});

import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for the keyLabel display logic used in KeyboardShortcutHelp.
 * Mirrors the SHIFT_SYMBOL_TO_DIGIT mapping and keyLabel function.
 */

const SHIFT_SYMBOL_TO_DIGIT: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', '$': '4',
  '%': '5', '^': '6', '&': '7', '*': '8',
  '(': '9', ')': '0',
};

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  group: string;
  label: string;
  handler: () => void;
}

function keyLabel(s: KeyboardShortcut): string {
  const parts: string[] = [];
  if (s.ctrl) parts.push('Ctrl');
  if (s.alt) parts.push('Alt');
  if (s.shift) parts.push('Shift');
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

function sc(key: string, opts: { shift?: boolean; ctrl?: boolean; alt?: boolean } = {}): KeyboardShortcut {
  return { key, shift: opts.shift, ctrl: opts.ctrl, alt: opts.alt, group: 'Test', label: 'test', handler: () => {} };
}

describe('keyLabel', () => {
  it('displays simple keys lowercase', () => {
    expect(keyLabel(sc('j'))).toBe('j');
    expect(keyLabel(sc('a'))).toBe('a');
  });

  it('displays Space for space key', () => {
    expect(keyLabel(sc(' '))).toBe('Space');
  });

  it('displays Enter and Esc for special keys', () => {
    expect(keyLabel(sc('Enter'))).toBe('Enter');
    expect(keyLabel(sc('Escape'))).toBe('Esc');
  });

  it('displays Shift + digit for shifted number symbols', () => {
    expect(keyLabel(sc('!', { shift: true }))).toBe('Shift + 1');
    expect(keyLabel(sc('@', { shift: true }))).toBe('Shift + 2');
    expect(keyLabel(sc('#', { shift: true }))).toBe('Shift + 3');
    expect(keyLabel(sc('$', { shift: true }))).toBe('Shift + 4');
    expect(keyLabel(sc('%', { shift: true }))).toBe('Shift + 5');
    expect(keyLabel(sc('^', { shift: true }))).toBe('Shift + 6');
    expect(keyLabel(sc('&', { shift: true }))).toBe('Shift + 7');
    expect(keyLabel(sc('*', { shift: true }))).toBe('Shift + 8');
    expect(keyLabel(sc('(', { shift: true }))).toBe('Shift + 9');
    expect(keyLabel(sc(')', { shift: true }))).toBe('Shift + 0');
  });

  it('displays Shift + letter for shifted letter keys', () => {
    expect(keyLabel(sc('A', { shift: true }))).toBe('Shift + a');
  });

  it('displays Ctrl prefix', () => {
    expect(keyLabel(sc('s', { ctrl: true }))).toBe('Ctrl + s');
  });

  it('displays combined modifiers in order', () => {
    expect(keyLabel(sc('s', { ctrl: true, alt: true, shift: true }))).toBe('Ctrl + Alt + Shift + s');
  });
});

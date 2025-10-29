import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe(
      'base conditional'
    );
  });

  it('merges tailwind classes without conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'other')).toBe('base other');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles duplicate class names', () => {
    const result = cn('duplicate', 'duplicate', 'unique');
    expect(result).toContain('duplicate');
    expect(result).toContain('unique');
  });

  it('handles complex tailwind variants', () => {
    expect(
      cn(
        'hover:bg-blue-500',
        'focus:bg-blue-600',
        'hover:bg-red-500'
      )
    ).toBe('focus:bg-blue-600 hover:bg-red-500');
  });
});

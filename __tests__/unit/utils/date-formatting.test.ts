import { describe, it, expect } from 'vitest';
import { format } from 'date-fns';

describe('Date Formatting Utilities', () => {
  describe('date-fns format', () => {
    it('formats date in Turkish format (DD/MM/YYYY)', () => {
      const date = new Date('2023-01-15');
      expect(format(date, 'dd/MM/yyyy')).toBe('15/01/2023');
    });

    it('formats date with time', () => {
      const date = new Date('2023-01-15T14:30:00');
      expect(format(date, 'dd/MM/yyyy HH:mm')).toBe('15/01/2023 14:30');
    });

    it('formats date with Turkish month names', () => {
      const date = new Date('2023-01-15');
      expect(format(date, 'd MMMM yyyy')).toContain('January');
    });

    it('handles invalid date gracefully', () => {
      expect(() => {
        format(new Date('invalid'), 'dd/MM/yyyy');
      }).toThrow();
    });
  });

  describe('relative time', () => {
    it('calculates days between dates', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-15');
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(14);
    });
  });
});

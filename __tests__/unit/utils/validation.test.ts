import { describe, it, expect } from 'vitest';

describe('Validation Utilities', () => {
  describe('email validation', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('phone validation (Turkish format)', () => {
    const validateTurkishPhone = (phone: string): boolean => {
      const phoneRegex = /^(\+90|0)?5\d{9}$/;
      return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    it('validates Turkish mobile numbers', () => {
      expect(validateTurkishPhone('05551234567')).toBe(true);
      expect(validateTurkishPhone('+905551234567')).toBe(true);
      expect(validateTurkishPhone('5551234567')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(validateTurkishPhone('1234567890')).toBe(false);
      expect(validateTurkishPhone('055512345')).toBe(false);
    });
  });

  describe('student number validation', () => {
    const validateStudentNumber = (number: string): boolean => {
      return /^[A-Z]{3}\d{3,6}$/.test(number);
    };

    it('validates student numbers', () => {
      expect(validateStudentNumber('STU001')).toBe(true);
      expect(validateStudentNumber('STU123456')).toBe(true);
    });

    it('rejects invalid student numbers', () => {
      expect(validateStudentNumber('123456')).toBe(false);
      expect(validateStudentNumber('ST001')).toBe(false);
      expect(validateStudentNumber('STU1')).toBe(false);
    });
  });
});

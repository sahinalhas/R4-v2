import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

function usePagination(totalItems: number, itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    nextPage,
    prevPage,
    goToPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}

import { useState } from 'react';

describe('usePagination', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => usePagination(100, 10));
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(10);
  });

  it('navigates to next page', () => {
    const { result } = renderHook(() => usePagination(100, 10));
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(2);
    expect(result.current.startIndex).toBe(10);
    expect(result.current.endIndex).toBe(20);
  });

  it('navigates to previous page', () => {
    const { result } = renderHook(() => usePagination(100, 10));
    
    act(() => {
      result.current.nextPage();
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(3);
    
    act(() => {
      result.current.prevPage();
    });
    
    expect(result.current.currentPage).toBe(2);
  });

  it('does not go below page 1', () => {
    const { result } = renderHook(() => usePagination(100, 10));
    
    act(() => {
      result.current.prevPage();
    });
    
    expect(result.current.currentPage).toBe(1);
  });

  it('does not go beyond last page', () => {
    const { result } = renderHook(() => usePagination(100, 10));
    
    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.nextPage();
      }
    });
    
    expect(result.current.currentPage).toBe(10);
  });

  it('goes to specific page', () => {
    const { result } = renderHook(() => usePagination(100, 10));
    
    act(() => {
      result.current.goToPage(5);
    });
    
    expect(result.current.currentPage).toBe(5);
    expect(result.current.startIndex).toBe(40);
    expect(result.current.endIndex).toBe(50);
  });

  it('calculates hasNext and hasPrev correctly', () => {
    const { result } = renderHook(() => usePagination(100, 10));
    
    expect(result.current.hasPrev).toBe(false);
    expect(result.current.hasNext).toBe(true);
    
    act(() => {
      result.current.goToPage(5);
    });
    
    expect(result.current.hasPrev).toBe(true);
    expect(result.current.hasNext).toBe(true);
    
    act(() => {
      result.current.goToPage(10);
    });
    
    expect(result.current.hasPrev).toBe(true);
    expect(result.current.hasNext).toBe(false);
  });

  it('handles non-even division of items', () => {
    const { result } = renderHook(() => usePagination(95, 10));
    
    expect(result.current.totalPages).toBe(10);
    
    act(() => {
      result.current.goToPage(10);
    });
    
    expect(result.current.startIndex).toBe(90);
    expect(result.current.endIndex).toBe(95);
  });
});

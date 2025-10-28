import type { Request, Response, NextFunction } from 'express';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with ID ${id} not found` : `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export function handleDatabaseError(
  operation: string,
  error: unknown,
  userMessage?: string
): never {
  const message = userMessage || 'Veritabanı işlemi başarısız oldu';
  
  if (error instanceof Error) {
    console.error(`[DB Error - ${operation}]:`, error.message);
    console.error('Stack:', error.stack);
    throw new DatabaseError(message, operation, error);
  }
  
  console.error(`[DB Error - ${operation}]:`, error);
  throw new DatabaseError(message, operation);
}

export function wrapRepositoryMethod<T extends any[], R>(
  operation: string,
  method: (...args: T) => R,
  userMessage?: string
): (...args: T) => R {
  return (...args: T): R => {
    try {
      return method(...args);
    } catch (error) {
      handleDatabaseError(operation, error, userMessage);
    }
  };
}

export function asyncWrapRepositoryMethod<T extends any[], R>(
  operation: string,
  method: (...args: T) => Promise<R>,
  userMessage?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await method(...args);
    } catch (error) {
      handleDatabaseError(operation, error, userMessage);
    }
  };
}

export function handleApiError(
  error: unknown,
  res: Response,
  defaultMessage = 'İşlem başarısız oldu'
): void {
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: error.message
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      success: false,
      error: error.message
    });
    return;
  }

  if (error instanceof DatabaseError) {
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }

  const message = error instanceof Error ? error.message : defaultMessage;
  console.error('[API Error]:', error);
  
  res.status(500).json({
    success: false,
    error: message
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  handleApiError(err, res);
}

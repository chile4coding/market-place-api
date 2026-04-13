export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;
  public readonly details?: unknown[];

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = "INTERNAL_ERROR",
    details?: unknown[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown[]) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409, "CONFLICT");
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}

export const createError = (
  message: string,
  statusCode: number = 500,
  errorCode: string = "INTERNAL_ERROR",
  details?: unknown[],
) => {
  return new AppError(message, statusCode, errorCode, details);
};

export const createValidationError = (message: string, details?: unknown[]) => {
  return new ValidationError(message, details);
};

export const createUnauthorizedError = (message: string = "Unauthorized") => {
  return new UnauthorizedError(message);
};

export const createForbiddenError = (message: string = "Forbidden") => {
  return new ForbiddenError(message);
};

export const createNotFoundError = (message: string = "Resource not found") => {
  return new NotFoundError(message);
};

export const createConflictError = (message: string = "Conflict") => {
  return new ConflictError(message);
};

export const createTooManyRequestsError = (message: string = "Too many requests") => {
  return new TooManyRequestsError(message);
};

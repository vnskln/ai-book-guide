export class APIError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code = "INTERNAL_SERVER_ERROR"
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends APIError {
  constructor(message = "Bad Request") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ConflictError extends APIError {
  constructor(message = "Resource Conflict") {
    super(message, 409, "CONFLICT");
  }
}

export class NotFoundError extends APIError {
  constructor(message = "Resource Not Found") {
    super(message, 404, "NOT_FOUND");
  }
}

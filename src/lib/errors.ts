/**
 * Base class for API errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when a user has too many pending requests
 */
export class TooManyRequestsError extends APIError {
  constructor(message = "Too Many Requests") {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}

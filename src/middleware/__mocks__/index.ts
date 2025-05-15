import { vi } from "vitest";

// Mock middleware implementation
export const defineMiddleware = (fn) => fn;
export const sequence = (...middlewares) => {
  return async (context, next) => {
    for (const middleware of middlewares) {
      await middleware(context, next);
    }
    return await next();
  };
};

// Mock specific middleware functions
export const authMiddleware = vi.fn().mockImplementation((context, next) => next());
export const csrfProtectionMiddleware = vi.fn().mockImplementation((context, next) => next());
export const ratelimitMiddleware = vi.fn().mockImplementation((context, next) => next());
export const corsMiddleware = vi.fn().mockImplementation((context, next) => next());

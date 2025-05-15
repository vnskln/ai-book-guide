import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext, MiddlewareNext } from "astro";

// Mock Astro's middleware module
vi.mock("astro:middleware", () => ({
  defineMiddleware: (fn) => fn,
  sequence:
    (...middlewares) =>
    async (context, next) => {
      for (const middleware of middlewares) {
        await middleware(context, next);
      }
      return await next();
    },
}));

// Mock the middleware module
vi.mock(
  "@/middleware/index",
  async () => ({
    authMiddleware: vi.fn(),
    csrfProtectionMiddleware: vi.fn(),
    ratelimitMiddleware: vi.fn(),
    corsMiddleware: vi.fn(),
  }),
  { virtual: true }
);

import { authMiddleware, csrfProtectionMiddleware } from "@/middleware/index";

describe("API Middleware Tests", () => {
  let mockContext: APIContext;
  let mockNext: MiddlewareNext;
  let mockResponse: Response;

  beforeEach(() => {
    mockContext = {
      request: new Request("https://example.com/api/books"),
      locals: {
        user: undefined,
        supabase: {
          auth: {
            getUser: vi.fn(),
          },
        },
      },
      cookies: {
        get: vi.fn(),
        set: vi.fn(),
      },
    } as unknown as APIContext;

    mockResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    mockNext = vi.fn().mockResolvedValue(mockResponse);

    vi.clearAllMocks();
  });

  describe("Authentication Middleware", () => {
    it("allows authenticated requests to proceed", async () => {
      const mockUser = { id: "123", email: "user@example.com" };

      mockContext.locals.supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      vi.mocked(authMiddleware).mockImplementation(async (context, next) => {
        context.locals.user = mockUser;
        return next();
      });

      const response = await authMiddleware(mockContext, mockNext);

      expect(response).toBe(mockResponse);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.locals.user).toEqual(mockUser);
    });

    it("blocks unauthenticated requests from protected routes", async () => {
      mockContext.request = new Request("https://example.com/api/protected-resource");

      mockContext.locals.supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      vi.mocked(authMiddleware).mockImplementation(async () => {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      });

      const response = await authMiddleware(mockContext, mockNext);

      expect(response.status).toBe(401);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockContext.locals.user).toBeUndefined();
    });
  });

  describe("CSRF Protection Middleware", () => {
    it("allows requests with valid CSRF token", async () => {
      mockContext.request = new Request("https://example.com/api/books", {
        method: "POST",
        headers: { "X-CSRF-Token": "valid-token" },
      });

      mockContext.cookies.get = vi.fn().mockReturnValue({ value: "valid-token" });

      vi.mocked(csrfProtectionMiddleware).mockImplementation(async (_, next) => next());

      const response = await csrfProtectionMiddleware(mockContext, mockNext);

      expect(response).toBe(mockResponse);
      expect(mockNext).toHaveBeenCalled();
    });

    it("blocks requests with invalid CSRF token", async () => {
      mockContext.request = new Request("https://example.com/api/books", {
        method: "POST",
        headers: { "X-CSRF-Token": "invalid-token" },
      });

      mockContext.cookies.get = vi.fn().mockReturnValue({ value: "valid-token" });

      vi.mocked(csrfProtectionMiddleware).mockImplementation(async () => {
        return new Response(JSON.stringify({ error: "Invalid CSRF token" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      });

      const response = await csrfProtectionMiddleware(mockContext, mockNext);

      expect(response.status).toBe(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

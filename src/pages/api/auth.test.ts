import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext } from "astro";

// Mock the middleware validation
vi.mock("../../../middleware/validation", () => ({
  validateRequest: vi.fn((_, schema) => {
    return Promise.resolve({
      email: "new@example.com",
      password: "password123!",
      passwordConfirmation: "password123!",
    });
  }),
}));

// Mock the Supabase client
vi.mock("@/db/supabase.server", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));

import { POST as signIn } from "@/pages/api/auth/login";
import { POST as signUp } from "@/pages/api/auth/register";
import { POST as signOut } from "@/pages/api/auth/logout";

describe("Authentication API endpoints", () => {
  let mockContext: APIContext;

  beforeEach(() => {
    mockContext = {
      request: new Request("https://example.com/api/auth"),
      locals: {
        supabase: {
          auth: {
            signInWithPassword: vi.fn().mockResolvedValue({
              data: { user: { id: "123" } },
              error: null,
            }),
            signUp: vi.fn().mockResolvedValue({
              data: { user: { id: "123" } },
              error: null,
            }),
            signOut: vi.fn().mockResolvedValue({ error: null }),
          },
        },
      },
      cookies: {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      },
      redirect: vi.fn(),
    } as unknown as APIContext;

    vi.clearAllMocks();
  });

  describe("Sign In endpoint", () => {
    it("returns user data on successful login", async () => {
      const requestBody = { email: "test@example.com", password: "password123" };

      mockContext.request = new Request("https://example.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await signIn(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(mockContext.locals.supabase.auth.signInWithPassword).toHaveBeenCalledWith(requestBody);
    });

    it("returns error on failed login", async () => {
      mockContext.locals.supabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid login credentials" },
      });

      mockContext.request = new Request("https://example.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "wrong@example.com", password: "wrong" }),
      });

      const response = await signIn(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("Sign Up endpoint", () => {
    it("registers a new user successfully", async () => {
      const requestBody = {
        email: "new@example.com",
        password: "password123!",
        passwordConfirmation: "password123!",
      };

      mockContext.request = new Request("https://example.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await signUp(mockContext);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user).toBeDefined();
      expect(mockContext.locals.supabase.auth.signUp).toHaveBeenCalled();
    });
  });

  describe("Sign Out endpoint", () => {
    it("signs out a user successfully", async () => {
      mockContext.request = new Request("https://example.com/api/auth/logout", {
        method: "POST",
      });

      const response = await signOut(mockContext);

      expect(response.status).toBe(200);
      expect(mockContext.locals.supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});

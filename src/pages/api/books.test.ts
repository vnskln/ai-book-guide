import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

// Mock data
const mockBooks = [
  { id: "1", title: "Book 1", author: "Author 1", cover_image: "cover1.jpg" },
  { id: "2", title: "Book 2", author: "Author 2", cover_image: "cover2.jpg" },
];

// Mock the Supabase client
vi.mock("@/db/supabase.server", () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Direct import from local files instead of path aliases
import { GET as getBooks, POST as createBook } from "../api/books/index";
import { GET as getBook } from "../api/books/[id]";

describe("Books API endpoints", () => {
  let mockContext: APIContext;

  beforeEach(() => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: mockBooks,
      error: null,
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: mockBooks[0],
      error: null,
    });

    const mockEq = vi.fn().mockReturnValue({
      single: mockSingle,
    });

    const mockInsert = vi.fn().mockResolvedValue({
      data: mockBooks[0],
      error: null,
    });

    const mockUpdate = vi.fn().mockResolvedValue({
      data: { ...mockBooks[0], title: "Updated Title" },
      error: null,
    });

    const mockDelete = vi.fn().mockResolvedValue({
      data: {},
      error: null,
    });

    mockContext = {
      request: new Request("https://example.com/api/books"),
      locals: {
        supabase: {
          from: vi.fn(() => ({
            select: mockSelect,
            eq: mockEq,
            insert: mockInsert,
            update: mockUpdate,
            delete: mockDelete,
          })),
        },
      },
      params: {},
    } as unknown as APIContext;

    vi.clearAllMocks();
  });

  describe("GET /books", () => {
    it("returns list of books", async () => {
      const response = await getBooks(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockBooks);
      expect(mockContext.locals.supabase.from).toHaveBeenCalledWith("books");
    });

    it("handles errors when fetching books fails", async () => {
      mockContext.locals.supabase.from = vi.fn(() => ({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      }));

      const response = await getBooks(mockContext);

      expect(response.status).toBe(500);
    });
  });

  describe("GET /books/[id]", () => {
    it("returns a single book by ID", async () => {
      mockContext.params = { id: "1" };

      // Properly set up the mock chain for this specific test
      mockContext.locals.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockBooks[0],
              error: null,
            }),
          }),
        }),
      }) as unknown as ReturnType<SupabaseClient<Database>["from"]>;

      const response = await getBook(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockBooks[0]);
      expect(mockContext.locals.supabase.from).toHaveBeenCalledWith("books");
    });

    it("returns 404 when book is not found", async () => {
      mockContext.params = { id: "999" };
      mockContext.locals.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Not found", code: "PGRST116" },
            }),
          }),
        }),
      }) as unknown as ReturnType<SupabaseClient<Database>["from"]>;

      const response = await getBook(mockContext);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /books", () => {
    it("creates a new book successfully", async () => {
      const newBook = { title: "New Book", author: "New Author", cover_image: "new-cover.jpg" };

      mockContext.request = new Request("https://example.com/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });

      // Properly set up the mock chain for this specific test
      mockContext.locals.supabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [mockBooks[0]],
            error: null,
          }),
        }),
      }) as unknown as ReturnType<SupabaseClient<Database>["from"]>;

      const response = await createBook(mockContext);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockBooks[0]);
    });
  });
});

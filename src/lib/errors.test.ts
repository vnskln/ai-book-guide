import { describe, it, expect } from "vitest";
import { APIError, TooManyRequestsError } from "./errors";

describe("Klasy błędów", () => {
  describe("APIError", () => {
    it("tworzy instancję z poprawnymi właściwościami", () => {
      const error = new APIError("Test error", 400, "BAD_REQUEST");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(APIError);
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.name).toBe("APIError");
    });
  });

  describe("TooManyRequestsError", () => {
    it("tworzy instancję z domyślną wiadomością", () => {
      const error = new TooManyRequestsError();

      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(TooManyRequestsError);
      expect(error.message).toBe("Too Many Requests");
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe("TOO_MANY_REQUESTS");
    });

    it("tworzy instancję z niestandardową wiadomością", () => {
      const error = new TooManyRequestsError("Niestandardowy błąd limitu zapytań");

      expect(error.message).toBe("Niestandardowy błąd limitu zapytań");
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe("TOO_MANY_REQUESTS");
      expect(error.name).toBe("TooManyRequestsError");
    });
  });
});

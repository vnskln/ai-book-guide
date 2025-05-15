import { vi } from "vitest";

// Mock Astro's middleware module
vi.mock(
  "astro:middleware",
  () => {
    return {
      defineMiddleware: (fn: any) => fn,
      sequence: (...middlewares: any[]) => {
        return async (context: any, next: any) => {
          for (const middleware of middlewares) {
            await middleware(context, next);
          }
          return await next();
        };
      },
    };
  },
  { virtual: true }
);

// Mock the TextEncoder/TextDecoder for esbuild
global.TextEncoder = class TextEncoder {
  encode(input: string): Uint8Array {
    return new Uint8Array(Buffer.from(input));
  }
};

global.TextDecoder = class TextDecoder {
  decode(input: Uint8Array): string {
    return Buffer.from(input).toString();
  }
};

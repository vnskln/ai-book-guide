// Mock for astro:middleware
export const defineMiddleware = (fn) => fn;
export const sequence = (...middlewares) => {
  return async (context, next) => {
    for (const middleware of middlewares) {
      await middleware(context, next);
    }
    return await next();
  };
};

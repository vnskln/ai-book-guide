type LogMetadata = Record<string, unknown>;

export const logger = {
  error: (message: string, errorOrMeta?: unknown) => {
    // eslint-disable-next-line no-console
    console.error(message, errorOrMeta);
  },
  info: (message: string, meta?: LogMetadata) => {
    // eslint-disable-next-line no-console
    console.info(message, meta);
  },
  warn: (message: string, meta?: LogMetadata) => {
    // eslint-disable-next-line no-console
    console.warn(message, meta);
  },
};

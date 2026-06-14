import { isAxiosError } from "axios";

// Pulls a human-readable message out of an unknown thrown value — NestJS error
// bodies ({ message: string | string[] }), generic Errors, or network failures.
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] } | undefined)
      ?.message;
    if (Array.isArray(message) && message.length) return message[0];
    if (typeof message === "string" && message) return message;
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

function readViteEnv(): string | undefined {
  try {
    return (import.meta as any)?.env?.API_BASE_URL;
  } catch {
    return undefined;
  }
}

function readExpoEnv(): string | undefined {
  try {
    return (
      (typeof process !== "undefined" &&
        process.env?.EXPO_PUBLIC_API_BASE_URL) ||
      undefined
    );
  } catch {
    return undefined;
  }
}

export const API_BASE_URL =
  readExpoEnv() || readViteEnv() || "http://localhost:8080";

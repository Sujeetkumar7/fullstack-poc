import { env } from "../config/env";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function http<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    token?: string | null;
  } = {}
): Promise<T> {
  const url = `${env.API_BASE_URL}${path}`;
  const { method = "POST", body, headers = {}, token } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // set to 'omit' if you don't use cookies
  });

  // Handle non-2xx
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      msg = errJson?.message ?? msg;
    } catch {}
    throw new Error(msg);
  }

  // Parse JSON
  try {
    return (await res.json()) as T;
  } catch {
    // if no JSON body
    return undefined as T;
  }
}

import { loadStoredSession } from "../auth/storage";

const API_BASE_URL = "http://localhost:4000/api";

function buildHeaders(init?: RequestInit, token?: string) {
  const headers = new Headers(init?.headers);
  const session = loadStoredSession();
  const authToken = token ?? session?.token;

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  return headers;
}

async function handleResponse<T>(response: Response) {
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent("cargoclear:unauthorized"));
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // Fall back to status-based message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function fetchJson<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(undefined, token)
  });

  return handleResponse<T>(response);
}

export async function requestJson<T>(path: string, init: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init, token)
  });

  return handleResponse<T>(response);
}

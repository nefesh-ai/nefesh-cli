import { getApiKey, getBaseUrl } from "./config";

export async function apiGet(path: string, params?: Record<string, string>): Promise<any> {
  const key = getApiKey();
  if (!key) throw new Error("No API key. Run: nefesh auth login --key YOUR_KEY");

  const url = new URL(`${getBaseUrl()}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }

  const resp = await fetch(url.toString(), {
    headers: {
      "X-Nefesh-Key": key,
      "X-Nefesh-SDK": "cli/1.0.0",
    },
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({})) as Record<string, any>;
    throw new Error(body.detail || `API error: ${resp.status}`);
  }
  return resp.json();
}

export async function apiPost(path: string, body: Record<string, any>): Promise<any> {
  const key = getApiKey();
  if (!key) throw new Error("No API key. Run: nefesh auth login --key YOUR_KEY");

  const resp = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "X-Nefesh-Key": key,
      "Content-Type": "application/json",
      "X-Nefesh-SDK": "cli/1.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({})) as Record<string, any>;
    throw new Error(data.detail || `API error: ${resp.status}`);
  }
  return resp.json();
}

export async function apiDelete(path: string): Promise<any> {
  const key = getApiKey();
  if (!key) throw new Error("No API key. Run: nefesh auth login --key YOUR_KEY");

  const resp = await fetch(`${getBaseUrl()}${path}`, {
    method: "DELETE",
    headers: { "X-Nefesh-Key": key },
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({})) as Record<string, any>;
    throw new Error(data.detail || `API error: ${resp.status}`);
  }
  return resp.json();
}

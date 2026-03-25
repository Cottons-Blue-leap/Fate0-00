const API_URL = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('fate0_token');
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('fate0_token', token);
  } else {
    localStorage.removeItem('fate0_token');
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as Record<string, string>).error || res.statusText);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// === Auth ===
export async function register(email: string, password: string) {
  const data = await request<{ token: string; userId: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string) {
  const data = await request<{ token: string; userId: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export function logout(): void {
  setToken(null);
}

// === Profile ===
export async function getServerProfile() {
  return request<{ profile: Record<string, unknown> | null }>('/api/profile');
}

export async function saveServerProfile(profile: Record<string, unknown>) {
  return request<{ ok: boolean }>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

// === History ===
export async function getServerHistory(limit = 50) {
  return request<{
    history: Array<{
      id: string;
      type: string;
      summary: string;
      data: unknown;
      createdAt: string;
    }>;
  }>(`/api/history?limit=${limit}`);
}

export async function syncHistory(
  entries: Array<{
    id: string;
    type: string;
    summary?: string;
    data?: unknown;
    createdAt: string;
  }>,
) {
  return request<{ synced: number }>('/api/history/sync', {
    method: 'POST',
    body: JSON.stringify({ entries }),
  });
}

// === Share ===
export async function createShare(type: string, data: unknown) {
  return request<{ id: string; url: string }>('/api/share', {
    method: 'POST',
    body: JSON.stringify({ type, data }),
  });
}

export async function getShare(id: string) {
  return request<{ type: string; data: unknown; createdAt: string }>(`/api/share/${id}`);
}

// === Limits ===
export async function getServerLimits() {
  return request<{ date: string; usedTypes: string[] }>('/api/limits');
}

export async function useServerLimit(type: string) {
  return request<{ ok: boolean }>('/api/limits/use', {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

// === Health ===
export async function checkHealth() {
  try {
    const data = await request<{ status: string }>('/api/health');
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// === Server availability ===
export function hasServer(): boolean {
  return !!API_URL;
}

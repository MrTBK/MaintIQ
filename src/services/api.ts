const BASE = (import.meta as any).env?.VITE_API_URL ?? "";

async function req(path: string, opts: RequestInit = {}) {
  let r: Response;
  try {
    r = await fetch(`${BASE}${path}`, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  } catch {
    throw new Error("Cannot reach the API. Check that the backend is running.");
  }
  if (r.status === 401) {
    const err: any = new Error("Invalid username or password.");
    err.status = 401;
    throw err;
  }
  if (!r.ok) throw new Error(`Request failed (${r.status})`);
  return r.json();
}

export const api = {
  health: () => req("/health"),
  login: (username: string, password: string) => req("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => req("/api/auth/logout", { method: "POST" }),
  me: () => req("/api/auth/me"),
  machines: (page = 1, page_size = 20) => req(`/api/machines?page=${page}&page_size=${page_size}`),
  machine: (id: string) => req(`/api/machines/${id}`),
  anomalies: (id: string) => req(`/api/machines/${id}/anomalies`),
  trend: (id: string, sensor = "vibration", bucket = "hour") =>
    req(`/api/machines/${id}/trend?sensor=${sensor}&bucket=${bucket}`),
  risks: () => req("/api/risks"),
  recommendations: () => req("/api/recommendations"),
  alerts: () => req("/api/alerts"),
  failures: () => req("/api/failures"),
  maintenance: () => req("/api/maintenance"),
  sources: () => req("/api/data-sources"),
  quality: () => req("/api/data-quality"),
  runs: () => req("/api/runs"),
  audit: () => req("/api/audit"),
  users: () => req("/api/users"),
  reviewAlert: (id: string) => req(`/api/alerts/${id}/review`, { method: "POST" }),
  resolveAlert: (id: string) => req(`/api/alerts/${id}/resolve`, { method: "POST" }),
  updateRecommendation: (id: string, status: string) =>
    req(`/api/recommendations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updateMaintenance: (id: string, status: string) =>
    req(`/api/maintenance/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  detectRun: () => req("/api/runs/detect", { method: "POST" }),
  trainFailureModel: () => req("/api/runs/train-failure-model", { method: "POST" }),
  createUser: (u: { username: string; password: string; role: string; display_name?: string; email?: string }) =>
    req("/api/users", { method: "POST", body: JSON.stringify(u) }),
  updateUser: (id: string, patch: { active?: boolean }) =>
    req(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  getThresholds: () => req("/api/settings/thresholds"),
  saveThresholds: (t: Record<string, number>) =>
    req("/api/settings/thresholds", { method: "PUT", body: JSON.stringify(t) }),
};

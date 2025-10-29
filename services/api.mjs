// Caminho: services/api.mjs

const BASE_URL = "https://yuanqfswhberkoevtmfr.supabase.co";
const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YW5xZnN3aGJlcmtvZXZ0bWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQzNjksImV4cCI6MjA3MDUzMDM2OX0.g8Fm4XAvtX46zifBZnYVH4tVuQkqUH6Ia9CXQj4DztQ";

export const apikey = API_KEY;

// --- LOGIN COM EMAIL E SENHA ---
export async function loginWithEmailAndPassword(email, password) {
  const response = await fetch(`${BASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Credenciais inválidas.");
  }

  if (data.access_token && typeof window !== "undefined") {
    localStorage.setItem("token", data.access_token);
  }

  return data;
}

// --- LOGIN PADRÃO AUTOMÁTICO ---
let loginPromise = null;

export async function login() {
  console.log("🔐 Iniciando login...");
  const res = await fetch(`${BASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      email: "riseup@popcode.com.br",
      password: "riseup",
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("❌ Erro no login:", res.status, msg);
    throw new Error(`Erro ao autenticar: ${res.status} - ${msg}`);
  }

  const data = await res.json();
  console.log("✅ Login bem-sucedido:", data);

  if (typeof window !== "undefined" && data.access_token) {
    localStorage.setItem("token", data.access_token);
  }

  return data;
}

// --- LOGOUT CENTRALIZADO ---
async function logout() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await fetch(`${BASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(
      "Falha ao invalidar token no servidor (pode já estar expirado):",
      error
    );
  }

  localStorage.removeItem("token");
}

// --- FUNÇÃO CENTRAL DE REQUISIÇÕES ---
async function request(endpoint, options = {}) {
  if (!loginPromise) loginPromise = login();

  try {
    await loginPromise;
  } catch (error) {
    console.error("⚠️ Falha ao autenticar:", error);
  } finally {
    loginPromise = null;
  }

  let token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    console.warn("⚠️ Token não encontrado, refazendo login...");
    const data = await login();
    token = data.access_token;
  }

  const headers = {
    "Content-Type": "application/json",
    apikey: API_KEY,
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const fullUrl =
    endpoint.startsWith("/rest/v1") || endpoint.startsWith("/functions/")
      ? `${BASE_URL}${endpoint}`
      : `${BASE_URL}/rest/v1${endpoint}`;

  console.log("🌐 Requisição para:", fullUrl);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    throw new Error(`Erro HTTP: ${response.status} - ${JSON.stringify(errorBody)}`);
  }

  if (response.status === 204) return {};

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) return {};

  return await response.json();
}

// --- EXPORTANDO OBJETO API ---
export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, data, options) =>
    request(endpoint, { method: "POST", body: JSON.stringify(data), ...options }),
  patch: (endpoint, data, options) =>
    request(endpoint, { method: "PATCH", body: JSON.stringify(data), ...options }),
  delete: (endpoint, options) =>
    request(endpoint, { method: "DELETE", ...options }),
  logout,
};

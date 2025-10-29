// Caminho: services/api.mjs

// As suas variáveis de ambiente já estão corretas no arquivo .env.local
const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Função de login que o seu formulário vai chamar.
 * Ela autentica e salva o token no localStorage.
 */
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

/**
 * Função de logout que o seu DashboardLayout vai chamar.
 */
async function logout() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await fetch(`${BASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        "apikey": API_KEY,
        "Authorization": `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Falha ao invalidar token no servidor (pode ser normal se o token já expirou):", error);
  } finally {
    // Limpa os dados do cliente independentemente do resultado do servidor
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");
  }
}

/**
 * Função genérica e centralizada para fazer requisições autenticadas.
 * Ela pega o token do localStorage automaticamente.
 */
async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    "apikey": API_KEY,
    // Adiciona o cabeçalho de autorização apenas se o token existir
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => response.text());
    console.error("Erro na requisição:", response.status, errorBody);
    throw new Error(`Erro na API: ${errorBody.message || JSON.stringify(errorBody)}`);
  }

  // Se a resposta for 204 No Content (como em um DELETE), não tenta fazer o parse do JSON
  if (response.status === 204) {
    return null;
  }

  return response.json();
}



// Exportamos um objeto 'api' com os métodos que os componentes vão usar.
export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, data, options) => request(endpoint, { method: "POST", body: JSON.stringify(data), ...options }),
  patch: (endpoint, data, options) => request(endpoint, { method: "PATCH", body: JSON.stringify(data), ...options }),
  delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
  logout: logout, // Exportando a função de logout
};

// SUBSTITUA TODO O CONTEÚDO DE services/api.mjs POR ESTE CÓDIGO

// Caminho: services/api.mjs

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Função de login que o seu formulário usa.
 * Ela continua exatamente como era.
 */
export async function login(email, senha) {
    console.log("🔐 Iniciando login...");
    const res = await fetch(`${BASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
            Prefer: "return=representation",
        },
        body: JSON.stringify({
            email: email,
            password: senha,
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
 * Função de logout.
 */
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
        console.error("Falha ao invalidar token no servidor:", error);
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user_info");
    }
}

/**
 * Função genérica para fazer requisições.
 * Agora com a correção para respostas vazias.
 */
async function request(endpoint, options = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        apikey: API_KEY,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => response.text());
        console.error("Erro na requisição:", response.status, errorBody);
        throw new Error(`Erro na API: ${errorBody.message || JSON.stringify(errorBody)}`);
    }

    // --- CORREÇÃO 1: PARA O SUBMIT DO AGENDAMENTO ---
    // Se a resposta for um sucesso de criação (201) ou sem conteúdo (204), não quebra.
    if (response.status === 201 || response.status === 204) {
        return null;
    }

    return response.json();
}

// Exportamos o objeto 'api' com os métodos que os componentes vão usar.
export const api = {
    // --- CORREÇÃO 2: PARA CARREGAR O ID DO USUÁRIO ---
    getSession: () => request("/auth/v1/user"),

    get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
    post: (endpoint, data, options) => request(endpoint, { method: "POST", body: JSON.stringify(data), ...options }),
    patch: (endpoint, data, options) => request(endpoint, { method: "PATCH", body: JSON.stringify(data), ...options }),
    delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
    logout: logout,
};

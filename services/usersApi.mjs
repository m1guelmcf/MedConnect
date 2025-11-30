import { httpClient } from "./httpClient";

class UsersService {
    /**
     * Obtém os dados completos do usuário logado (User + Profile + Roles)
     * Substitui a antiga lógica que dependia de api.getSession
     */
    async getMe() {
        // 1. Busca o usuário da sessão atual direto do Auth do Supabase
        const user = await httpClient.get("/auth/v1/user");
        
        if (!user || !user.id) {
            throw new Error("Usuário não autenticado.");
        }

        // 2. Com o ID, busca os dados completos
        return this.full_data(user.id);
    }

    /**
     * Endpoint simples para informações básicas (usado no login)
     */
    async getMeSimple() {
        return await httpClient.post("/functions/v1/user-info");
    }

    /**
     * Lista as roles (cargos) dos usuários
     */
    async list_roles() {
        return await httpClient.get("/rest/v1/user_roles?select=id,user_id,role,created_at");
    }

    /**
     * Cria um usuário administrativo (Médico, Gestor, Secretária)
     * @param {object} data 
     */
    async create_user(data) {
        return await httpClient.post("/functions/v1/create-user-with-password", data);
    }

    /**
     * Registra um novo paciente (Endpoint Público)
     * @param {object} data 
     */
    async registerPatient(data) {
        // Nota: Este endpoint é público, o httpClient gerencia isso se não houver token
        return await httpClient.post("/functions/v1/register-patient", data);
    }

    /**
     * Busca dados agregados de um usuário (Profile + Roles + Permissions)
     * @param {string} user_id 
     */
    async full_data(user_id) {
        if (!user_id) throw new Error("user_id é obrigatório");

        // Executa chamadas em paralelo para performance
        const [profiles, roles] = await Promise.all([
            httpClient.get(`/rest/v1/profiles?id=eq.${user_id}`),
            httpClient.get(`/rest/v1/user_roles?user_id=eq.${user_id}`)
        ]);

        const profile = profiles && profiles.length > 0 ? profiles[0] : {};
        const roleData = roles && roles.length > 0 ? roles[0] : {};
        const roleName = roleData.role || "paciente"; // Fallback seguro

        // Define permissões baseadas na role
        const permissions = {
            isAdmin: roleName === "admin",
            isManager: roleName === "gestor",
            isDoctor: roleName === "medico",
            isSecretary: roleName === "secretaria",
            isAdminOrManager: ["admin", "gestor"].includes(roleName),
        };

        return {
            user: {
                id: user_id,
                email: profile.email || "—",
                email_confirmed_at: null,
                created_at: profile.created_at || "—",
                last_sign_in_at: null,
            },
            profile: {
                id: profile.id || user_id,
                full_name: profile.full_name || "Usuário",
                email: profile.email || "—",
                phone: profile.phone || "—",
                avatar_url: profile.avatar_url || null,
                disabled: profile.disabled || false,
                created_at: profile.created_at || null,
                updated_at: profile.updated_at || null,
            },
            roles: [roleName],
            permissions,
        };
    }

    /**
     * Envia email de recuperação de senha
     * @param {string} email 
     */
    async resetPassword(email) {
        if (!email) throw new Error("Email é obrigatório.");
        
        // Endpoint de recuperação do Supabase Auth
        return await httpClient.post("/auth/v1/recover", { 
            email,
            redirect_to: window.location.origin + "/reset-password" // URL de retorno
        });
    }
}

// Singleton
export const usersService = new UsersService();
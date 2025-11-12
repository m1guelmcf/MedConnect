import { api } from "./api.mjs";

export const usersService = {
  // Função getMe corrigida para chamar a si mesma pelo nome
  async getMe() {
    const sessionData = await api.getSession();
    if (!sessionData?.id) {
      console.error("Sessão não encontrada ou usuário sem ID.", sessionData);
      throw new Error("Usuário não autenticado.");
    }
    // Chamando a outra função do serviço pelo nome explícito
    return usersService.full_data(sessionData.id);
  },

  async list_roles() {
    return await api.get(`/rest/v1/user_roles?select=id,user_id,role,created_at`);
  },

  async create_user(data) {
    // Esta é a função usada no page.tsx para criar usuários que não são médicos
    return await api.post(`/functions/v1/create-user-with-password`, data);
  },

  // --- NOVA FUNÇÃO ADICIONADA AQUI ---
  // Esta função chama o endpoint público de registro de paciente.
  async registerPatient(data) {
    // POR QUÊ? Este endpoint é público e não requer token JWT, resolvendo o erro 401.
    return await api.post('/functions/v1/register-patient', data);
  },
  // --- FIM DA NOVA FUNÇÃO ---

  async full_data(user_id) {
    if (!user_id) throw new Error("user_id é obrigatório");

    const [profile] = await api.get(`/rest/v1/profiles?id=eq.${user_id}`);
    const [role] = await api.get(`/rest/v1/user_roles?user_id=eq.${user_id}`);
    const permissions = {
      isAdmin: role?.role === "admin",
      isManager: role?.role === "gestor",
      isDoctor: role?.role === "medico",
      isSecretary: role?.role === "secretaria",
      isAdminOrManager:
        role?.role === "admin" || role?.role === "gestor" ? true : false,
    };

    return {
      user: {
        id: user_id,
        email: profile?.email ?? "—",
        email_confirmed_at: null,
        created_at: profile?.created_at ?? "—",
        last_sign_in_at: null,
      },
      profile: {
        id: profile?.id ?? user_id,
        full_name: profile?.full_name ?? "—",
        email: profile?.email ?? "—",
        phone: profile?.phone ?? "—",
        avatar_url: profile?.avatar_url ?? null,
        disabled: profile?.disabled ?? false,
        created_at: profile?.created_at ?? null,
        updated_at: profile?.updated_at ?? null,
      },
      roles: [role?.role ?? "—"],
      permissions,
    };
  },
};
import { api } from "./api.mjs";

export const usersService = {
  async list_roles() {
    // continua usando /rest/v1 normalmente
    return await api.get(`/rest/v1/user_roles?select=id,user_id,role,created_at`);
  },

  async create_user(data) {
    // continua usando a Edge Function corretamente
    return await api.post(`/functions/v1/create-user-with-password
`, data);
  },

  // 🚀 Busca dados completos do usuário direto do banco
  async full_data(user_id) {
    if (!user_id) throw new Error("user_id é obrigatório");

    // Busca o perfil
    const [profile] = await api.get(`/rest/v1/profiles?id=eq.${user_id}`);
    // Busca o papel (role)
    const [role] = await api.get(`/rest/v1/user_roles?user_id=eq.${user_id}`);
    // Busca as permissões se existirem em alguma tabela
    const permissions = {
      isAdmin: role?.role === "admin",
      isManager: role?.role === "gestor",
      isDoctor: role?.role === "medico",
      isSecretary: role?.role === "secretaria",
      isAdminOrManager:
        role?.role === "admin" || role?.role === "gestor" ? true : false,
    };

    // Monta o objeto no mesmo formato do endpoint `user-info`
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
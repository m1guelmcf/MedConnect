import { api } from "./api.mjs";

const REPORTS_API_URL = "/rest/v1/reports";

export const reportsApi = {
  getReports: async (patientId) => {
    try {
      console.log(`📡 Buscando laudos para o Patient ID: ${patientId}`);

      // MUDANÇA IMPORTANTE: 
      // 1. Adicionado '&select=*' para garantir que os campos venham
      // 2. Adicionado '&order=created_at.desc' para ordenar do mais novo para o mais antigo
      const data = await api.get(`${REPORTS_API_URL}?patient_id=eq.${patientId}&select=*&order=created_at.desc`);

      console.log("✅ Laudos encontrados:", data);

      // Garante que retorna um array mesmo se der erro no formato
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Falha ao buscar reports:", error);
      // Retorna array vazio para não quebrar a tela
      return [];
    }
  },

  getReportById: async (reportId) => {
    try {
      // Adicionado '&select=*'
      const data = await api.get(`${REPORTS_API_URL}?id=eq.${reportId}&select=*`);
      // O Supabase retorna um array, pegamos o primeiro item
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Falha ao buscar report ${reportId}:`, error);
      throw error;
    }
  },

  createReport: async (reportData) => {
    try {
      // Forçamos um header para garantir que o Supabase devolva o objeto criado
      const config = {
        headers: {
          'Prefer': 'return=representation'
        }
      };

      // Se sua função api.post aceitar config como terceiro argumento:
      const data = await api.post(REPORTS_API_URL, reportData, config);
      return data;
    } catch (error) {
      console.error("Falha ao criar report:", error);
      throw error;
    }
  },

  updateReport: async (reportId, reportData) => {
    try {
      const data = await api.patch(`${REPORTS_API_URL}?id=eq.${reportId}`, reportData);
      return data;
    } catch (error) {
      console.error(`Falha ao atualizar report ${reportId}:`, error);
      throw error;
    }
  },
};
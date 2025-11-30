import { httpClient } from "./httpClient";

class ReportsService {
  constructor() {
    this.basePath = "/rest/v1/reports";
  }

  /**
   * Busca laudos de um paciente específico
   * @param {string} patientId 
   */
  async getReports(patientId) {
    // Ordena por data de criação decrescente (mais recentes primeiro)
    return await httpClient.get(`${this.basePath}?patient_id=eq.${patientId}&order=created_at.desc`);
  }

  /**
   * Busca um laudo específico por ID
   * @param {string} reportId 
   */
  async getReportById(reportId) {
    const data = await httpClient.get(`${this.basePath}?id=eq.${reportId}`);
    // A API REST retorna um array, pegamos o primeiro item
    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Cria um novo laudo
   * @param {object} reportData 
   */
  async createReport(reportData) {
    return await httpClient.post(this.basePath, reportData);
  }

  /**
   * Atualiza um laudo existente
   * @param {string} reportId 
   * @param {object} reportData 
   */
  async updateReport(reportId, reportData) {
    return await httpClient.patch(`${this.basePath}?id=eq.${reportId}`, reportData);
  }
}

// Singleton
export const reportsApi = new ReportsService();
import { httpClient } from "./httpClient.ts";

class DoctorsService {
  constructor() {
    this.basePath = "/rest/v1/doctors";
  }

  /**
   * Lista todos os médicos
   */
  async list() {
    return await httpClient.get(this.basePath);
  }

  /**
   * Busca médico por ID
   * @param {string} id 
   */
  async getById(id) {
    const data = await httpClient.get(`${this.basePath}?id=eq.${id}`);
    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Cria um novo médico (via Edge Function para segurança)
   * @param {object} data 
   */
  async create(data) {
    return await httpClient.post("/functions/v1/create-doctor", data);
  }

  /**
   * Atualiza dados do médico
   * @param {string} id 
   * @param {object} data 
   */
  async update(id, data) {
    return await httpClient.patch(`${this.basePath}?id=eq.${id}`, data);
  }

  /**
   * Deleta um médico
   * @param {string} id 
   */
  async delete(id) {
    return await httpClient.delete(`${this.basePath}?id=eq.${id}`);
  }
}

// Exporta uma instância da classe (Singleton pattern simplificado)
export const doctorsService = new DoctorsService();
import { httpClient } from "./httpClient";

class PatientsService {
  constructor() {
    this.basePath = "/rest/v1/patients";
  }

  /**
   * Lista todos os pacientes
   */
  async list() {
    return await httpClient.get(this.basePath);
  }

  /**
   * Busca paciente por ID
   * @param {string} id 
   */
  async getById(id) {
    // Retorna array, conforme padrão do Supabase REST
    return await httpClient.get(`${this.basePath}?id=eq.${id}`);
  }

  /**
   * Cria um novo paciente
   * @param {object} data 
   */
  async create(data) {
    // Usa a Edge Function para validação de CPF e regras de negócio
    return await httpClient.post("/functions/v1/create-patient", data);
  }

  /**
   * Atualiza dados do paciente
   * @param {string} id 
   * @param {object} data 
   */
  async update(id, data) {
    return await httpClient.patch(`${this.basePath}?id=eq.${id}`, data);
  }

  /**
   * Deleta um paciente
   * @param {string} id 
   */
  async delete(id) {
    return await httpClient.delete(`${this.basePath}?id=eq.${id}`);
  }
}

// Singleton
export const patientsService = new PatientsService();
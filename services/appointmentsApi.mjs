import { httpClient } from "./httpClient";

class AppointmentsService {
  constructor() {
    this.basePath = "/rest/v1/appointments";
  }

  /**
   * Busca por horários disponíveis (Edge Function)
   * @param {object} data - { doctor_id, date }
   */
  async search_h(data) {
    return await httpClient.post('/functions/v1/get-available-slots', data);
  }

  /**
   * Lista todos os agendamentos
   */
  async list() {
    return await httpClient.get(this.basePath);
  }

  /**
   * Cria um novo agendamento
   * @param {object} data 
   */
  async create(data) {
    return await httpClient.post(this.basePath, data);
  }

  /**
   * Busca agendamentos com filtros complexos (Query String)
   * @param {string} queryParams - ex: 'patient_id=eq.123&status=eq.scheduled'
   */
  async search_appointment(queryParams) {
    return await httpClient.get(`${this.basePath}?${queryParams}`);
  }

  /**
   * Atualiza um agendamento
   * @param {string} id 
   * @param {object} data 
   */
  async update(id, data) {
    return await httpClient.patch(`${this.basePath}?id=eq.${id}`, data);
  }

  /**
   * Deleta um agendamento
   * @param {string} id 
   */
  async delete(id) {
    return await httpClient.delete(`${this.basePath}?id=eq.${id}`);
  }
}

// Singleton
export const appointmentsService = new AppointmentsService();
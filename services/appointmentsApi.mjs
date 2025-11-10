import { api } from "./api.mjs";




export const appointmentsService = {
  /**
   * Busca por horários disponíveis para agendamento.
   * @param {object} data - Critérios da busca (ex: { doctor_id, date }).
   * @returns {Promise<Array>} - Uma promessa que resolve para uma lista de horários disponíveis.
   */
  search_h: (data) => api.post('/functions/v1/get-available-slots', data),

  /**
   * Lista todos os agendamentos.
   * @returns {Promise<Array>} - Uma promessa que resolve para a lista de agendamentos.
   */
  list: () => api.get('/rest/v1/appointments'),

  /**
   * Cria um novo agendamento.
   * @param {object} data - Os dados do agendamento a ser criado.
   * @returns {Promise<object>} - Uma promessa que resolve para o agendamento criado.
   */
  create: (data) => api.post('/rest/v1/appointments', data),

  /**
   * Busca agendamentos com base em parâmetros de consulta.
   * @param {string} queryParams - A string de consulta (ex: 'patient_id=eq.123&status=eq.scheduled').
   * @returns {Promise<Array>} - Uma promessa que resolve para a lista de agendamentos encontrados.
   */
  search_appointment: (queryParams) => api.get(`/rest/v1/appointments?${queryParams}`),

  /**
   * Atualiza um agendamento existente.
   * @param {string|number} id - O ID do agendamento a ser atualizado.
   * @param {object} data - Os novos dados para o agendamento.
   * @returns {Promise<object>} - Uma promessa que resolve com a resposta da API.
   */
  update: (id, data) => api.patch(`/rest/v1/appointments?id=eq.${id}`, data),

  /**
   * Deleta um agendamento.
   * @param {string|number} id - O ID do agendamento a ser deletado.
   * @returns {Promise<object>} - Uma promessa que resolve com a resposta da API.
   */
  delete: (id) => api.delete(`/rest/v1/appointments?id=eq.${id}`),

  send_sms: (data) => api.post("/functions/v1/send-sms", data)

};
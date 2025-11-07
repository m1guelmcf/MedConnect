import { api } from "./api.mjs";

export const AvailabilityService = {
    list: () => api.get("/rest/v1/doctor_availability"),
    listById: (id) => api.get(`/rest/v1/doctor_availability?doctor_id=eq.${id}`),
    create: (data) => api.post("/rest/v1/doctor_availability", data),
    update: (id, data) => api.patch(`/rest/v1/doctor_availability?id=eq.${id}`, data),
    delete: (id) => api.delete(`/rest/v1/doctor_availability?id=eq.${id}`),
    
};
export async function getDisponibilidadeByMedico(idMedico) {
  try {
    const response = await api.get(`/disponibilidade/${idMedico}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar disponibilidade do médico:", error);
    return [];
  }
}

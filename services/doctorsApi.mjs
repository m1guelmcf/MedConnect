import { api } from "./api.mjs";

export const doctorsService  = {
  list: () => api.get("/rest/v1/doctors"),
  getById: (id) => api.get(`/rest/v1/doctors?id=eq.${id}`).then(data => data[0]), 
  create: (data) => api.post("/functions/v1/create-doctor", data),
  update: (id, data) => api.patch(`/rest/v1/doctors?id=eq.${id}`, data),
  delete: (id) => api.delete(`/rest/v1/doctors?id=eq.${id}`),
};
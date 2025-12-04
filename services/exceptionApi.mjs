import { api } from "./api.mjs";

export const exceptionsService = {
    list: () => api.get("/rest/v1/doctor_exceptions"),
    listById: () => api.get(`/rest/v1/doctor_exceptions?id=eq.${id}`),
    create: (data) => api.post("/rest/v1/doctor_exceptions", data),
    delete: (id) => api.delete(`/rest/v1/doctor_exceptions?id=eq.${id}`),
};

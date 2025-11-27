import { api } from "./api.mjs";

const REPORTS_API_URL = "/rest/v1/reports";

export const reportsApi = {
  getReports: async (patientId) => {
    try {
      const data = await api.get(`${REPORTS_API_URL}?patient_id=eq.${patientId}`);
      return data;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      throw error;
    }
  },
  getReportById: async (reportId) => {
    try {
      const data = await api.get(`${REPORTS_API_URL}?id=eq.${reportId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch report ${reportId}:`, error);
      throw error;
    }
  },
  createReport: async (reportData) => {
    try {
      const data = await api.post(REPORTS_API_URL, reportData);
      return data;
    } catch (error) {
      console.error("Failed to create report:", error);
      throw error;
    }
  },
  updateReport: async (reportId, reportData) => {
    try {
      const data = await api.patch(`${REPORTS_API_URL}?id=eq.${reportId}`, reportData);
      return data;
    } catch (error) {
      console.error(`Failed to update report ${reportId}:`, error);
      throw error;
    }
  },
};

import API from "./api";

export const getDocs = () => API.get("/docs");
export const createDoc = () => API.post("/docs");
export const getDocById = (id, shareToken) =>
  API.get(`/docs/${id}`, { params: shareToken ? { shareToken } : {} });
export const updateDoc = (id, data, shareToken) =>
  API.put(`/docs/${id}`, data, { params: shareToken ? { shareToken } : {} });
export const createShareLink = (id, role) => API.post(`/docs/${id}/share`, { role });
export const getVersions = (id, shareToken) =>
  API.get(`/docs/${id}/versions`, { params: shareToken ? { shareToken } : {} });
export const restoreVersion = (id, versionId, shareToken) =>
  API.post(`/docs/${id}/versions/${versionId}/restore`, {}, { params: shareToken ? { shareToken } : {} });
export const deleteDoc = (id) => API.delete(`/docs/${id}`);

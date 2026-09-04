import api from "./api.js";

const fileService = {
  async listFiles(page = 1) {
    const { data } = await api.get(`/files/?page=${page}`);
    return data; // { count, next, previous, results }
  },
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/files/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress) onProgress(Math.round((evt.loaded * 100) / evt.total));
      },
    });
    return data;
  },
  async deleteFile(id) {
    await api.delete(`/files/${id}/`);
  },
};

export default fileService;
import api from "./api.js";

const driveService = {
  async getStatus() {
    const { data } = await api.get("/drive/status/");
    return data;
  },
  connect() {
    const token = localStorage.getItem("access_token");
    window.location.href = `http://localhost:8000/api/drive/connect/?token=${token}`;
  },
  async importFiles(files, accessToken, accessTokenScope) {
    const { data } = await api.post("/drive/import/", {
      files,
      access_token: accessToken,
      access_token_scope: accessTokenScope,
    });
    return data;
  },
};

export default driveService;

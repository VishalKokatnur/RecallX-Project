import api from "./api.js";

// Same base URL the rest of the app uses for API calls (e.g.
// https://recallx-backend-bigq.onrender.com/api), with the trailing
// "/api" stripped off since this is a plain browser redirect, not an
// axios call through that instance.
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");

const driveService = {
  async getStatus() {
    const { data } = await api.get("/drive/status/");
    return data;
  },
  connect() {
    const token = localStorage.getItem("access_token");
    window.location.href = `${API_ORIGIN}/api/drive/connect/?token=${token}`;
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
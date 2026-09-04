import api from "./api.js";

const authService = {
  async register(payload) {
    const { data } = await api.post("/auth/register/", payload);
    return data;
  },
  async login({ username, password }) {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    return data;
  },
  async getProfile() {
    const { data } = await api.get("/auth/profile/");
    return data;
  },
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

export default authService;

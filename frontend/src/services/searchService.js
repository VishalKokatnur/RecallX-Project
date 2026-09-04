import api from "./api.js";

const searchService = {
  async search({ query, file_type, date_filter }) {
    const { data } = await api.post("/search/", { query, file_type, date_filter });
    return data;
  },
  async getHistory() {
    const { data } = await api.get("/search/history/");
    return data;
  },
  async askAssistant(question) {
    const { data } = await api.post("/search/assistant/", { question });
    return data;
  },
};

export default searchService;
import api from "./api.js";

const memoryMapService = {
  async getMemoryMap() {
    const { data } = await api.get("/knowledge/memory-map/");
    return data;
  },
};

export default memoryMapService;
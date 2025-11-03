// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // port mock BE kamu (misal: 5000)
});

export default api;

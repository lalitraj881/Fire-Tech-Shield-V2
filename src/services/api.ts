import axios from "axios";
const API_KEY = "c7099421849d5b9";
const API_SECRET = "d14167c86a93aa5";

const token = btoa(`${API_KEY}:${API_SECRET}`);

export const api = axios.create({ 
  baseURL: "https://aivio.c-metric.net",
  withCredentials: true, // REQUIRED for ERPNext session cookies
  headers: {
    "Content-Type": "application/json",
    "Authorization": `token c7099421849d5b9:d14167c86a93aa5`,

  },
});

import axios from "axios";

const API_HOST = process.env.REACT_APP_API_HOST || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_HOST,
  withCredentials: true,
});

export default apiClient;

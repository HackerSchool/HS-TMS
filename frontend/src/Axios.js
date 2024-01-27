import axios from "axios";

const axios_instance = axios.create({
  baseURL: import.meta.env.VITE_API_ADDRESS,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default axios_instance;

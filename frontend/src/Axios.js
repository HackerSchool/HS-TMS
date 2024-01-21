import axios from "axios";

const axios_instance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default axios_instance;

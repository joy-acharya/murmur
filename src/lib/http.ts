import axios from "axios";

export const http = axios.create({
  baseURL: "/api",
});

// for this test: treat user 1 as "me"
http.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["x-user-id"] = "1";
  return config;
});

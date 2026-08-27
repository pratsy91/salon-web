import axios from "axios";

const TOKEN_KEY = "salon_crm_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://salon-backend-ix9p.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("salon_crm_user");
      if (!window.location.pathname.startsWith("/login"))
        window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);

export function errorMessage(error, fallback = "Something went wrong.") {
  return error?.response?.data?.message || error?.message || fallback;
}

export function errorCode(error) {
  return error?.response?.data?.error || null;
}

export { TOKEN_KEY };
export default api;

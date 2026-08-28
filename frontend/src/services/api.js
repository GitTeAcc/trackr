import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");
export const updateProfile = (data) => api.put("/auth/me", data);

export const getTransactions = (params) => api.get("/transactions", { params });
export const addTransaction = (data) => api.post("/transactions", data);
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

export const getCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getBudgets = (params) => api.get("/budgets", { params });
export const setBudget = (data) => api.post("/budgets", data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);

export const getMonthlySummary = (params) => api.get("/reports/summary", { params });
export const getSpendingTrend = (params) => api.get("/reports/trend", { params });

export const getMyHousehold = () => api.get("/household/me");
export const createHousehold = (data) => api.post("/household/create", data);
export const joinHousehold = (data) => api.post("/household/join", data);
export const leaveHousehold = () => api.delete("/household/leave");

export default api;

import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "https://ideas-hub-1.onrender.com",
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Fixed Loop Issue)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Agar error 401 hai aur humne retry nahi kiya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const res = await axios.post("https://ideas-hub-1.onrender.com/auth/refresh", {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.access_token;
        Cookies.set("access_token", newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // 🛑 FIX: Refresh fail honay par sirf cookies clear karein.
        // Page reload (window.location.href) NA karein. 
        // App.jsx khud user ko logout state mein daal dega.
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        
        // window.location.href = "/login"; // <--- YEH LINE HATA DI HAI (Loop ki wajah)
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- API Functions ---

export const loginUser = async (data) => {
  const res = await api.post("/login", data);
  return res.data;
};

export const signupUser = async (data) => {
  const res = await api.post("/signup", data);
  return res.data;
};

export const getMe = async () => {
  const response = await api.get('/me'); 
  return response.data;
};

export const verifyEmailGet = async (token) => {
  const res = await api.get(`/verify-email?token=${token}`);
  return res.data;
};

export const verifyEmailPost = async ({ email, token }) => {
  const res = await api.post("/verify-email", { email, token });
  return res.data;
};

export const resendVerification = async (email) => {
  const res = await api.post("/resend-verification", { email });
  return res.data;
};

export const getVerificationStatus = async () => {
  const res = await api.get("/verification-status");
  return res.data;
};

export default api;
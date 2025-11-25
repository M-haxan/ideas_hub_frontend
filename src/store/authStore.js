import { create } from "zustand";
import Cookies from "js-cookie";

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null, // <-- 1. 'user' state add karein

  // 2. 'setAuthenticated' ko update karein taa ke yeh user data bhi le sakay
  setAuthenticated: (value, userData = null) => {
    set({ isAuthenticated: value, user: userData });
  },

  checkAuth: () => {
    const token = Cookies.get("access_token");
    if (token) {
      set({ isAuthenticated: true });
      // NOTE: Page refresh par, 'user' object null hoga jab tak
      // aap /me endpoint se data fetch nahi kartay (jo hum baad mein kar saktay hain).
      // Abhi ke liye, login/signup hi user object set karein gay.
    } else {
      set({ isAuthenticated: false, user: null });
    }
  },

  logout: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    set({ isAuthenticated: false, user: null }); // <-- 3. Logout par user ko null kar dein
  },
}));
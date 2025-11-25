import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

// 'roles' prop add karein (jo aik array hoga)
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Check if user is logged in
  if (!isAuthenticated) {
    // Agar logged in nahi, tou login page par redirect karein
    return <Navigate to="/login" />;
  }

  // 2. Check if this route requires specific roles
  if (roles && roles.length > 0) {
    // Agar route roles mang raha hai, check karein user ka role
    // 'user' object null ho sakta hai agar page refresh hua, 
    // lekin hum assume kar rahay hain k login k baad yeh set ho chuka hai.
    if (!user || !roles.includes(user.role)) {
      // User logged in hai, lekin role match nahi karta
      toast.error("You are not authorized to view this page.");
      // Unauthorized users ko dashboard par bhej dein
      return <Navigate to="/dashboard" />;
    }
  }

  // Agar user logged in hai aur role bhi (agar zaroori tha) match karta hai:
  return children;
}
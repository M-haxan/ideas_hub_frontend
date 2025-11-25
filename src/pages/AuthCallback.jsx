import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuthStore } from "../store/authStore";
import { getMe } from "../api/auth"; 
import toast from "react-hot-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore();
  const [status, setStatus] = useState("Processing login...");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleAuth = async () => {
      // 1. URL se data nikalein
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const urlAccessToken = params.get("access_token") || params.get("token");
      const urlRefreshToken = params.get("refresh_token");

      // Agar Google se koi error aaya ho
      if (error) {
        setStatus("Login Failed");
        setErrorMsg(error);
        return;
      }

      // 2. Agar Backend ne URL mein Tokens bheje hain (Recommended fix)
      if (urlAccessToken) {
        // Tokens ko JS cookies mein save karein
        Cookies.set("access_token", urlAccessToken, { expires: 7 });
        if (urlRefreshToken) {
          Cookies.set("refresh_token", urlRefreshToken, { expires: 7 });
        }
      }

      // 3. User verify karne ki koshish karein
      try {
        setStatus("Verifying session...");
        
        // Backend ko call karein (Yeh automatically Cookie ya Header token use kare ga)
        const user = await getMe();

        if (user) {
          setAuthenticated(true, user);
          toast.success(`Welcome back, ${user.name || "User"}!`);
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Auth Callback Error:", err);
        setStatus("Verification Failed");
        // Error detail dikhayein
        if (err.response?.status === 401) {
          setErrorMsg("Session not found. (Cookie missing or blocked by browser)");
        } else {
          setErrorMsg(err.message || "Unknown error occurred");
        }
      }
    };

    // Thora delay taa ke cookie set ho jaye
    setTimeout(() => {
        handleAuth();
    }, 500);

  }, [navigate, setAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      {status === "Verification Failed" || status === "Login Failed" ? (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">{status}</h2>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            
            <div className="bg-gray-100 p-3 rounded text-xs text-left text-gray-500 mb-6">
                <strong>Tip for Developer:</strong><br/>
                Agar "Session not found" aa raha hai, to backend developer se kahein ke 
                Redirect URL mein tokens add karein. <br/>
                Example: <code>/auth/callback?access_token=XYZ</code>
            </div>

            <button 
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
                Back to Login
            </button>
        </div>
      ) : (
        <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">{status}</h2>
        </>
      )}
    </div>
  );
}
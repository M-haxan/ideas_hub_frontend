import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { verifyEmailGet, resendVerification, getVerificationStatus } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Status: idle, verifying, success, error
  const [status, setStatus] = useState("idle"); 

  // 1. Automatic Verification via URL Token
  useEffect(() => {
    if (tokenFromUrl) {
      setStatus("verifying");
      // Agar URL me token hai, to GET request try karein
      verifyEmailGet(tokenFromUrl)
        .then(() => {
          setStatus("success");
          toast.success("Email verified successfully!");
          setTimeout(() => navigate("/dashboard"), 3000);
        })
        .catch((err) => {
          console.error(err);
          setStatus("error");
          // Error message dikhayein
          const msg = err.response?.data?.detail || "Verification failed. Link might be expired.";
          toast.error(msg);
        });
    }
  }, [tokenFromUrl, navigate]);

  // 2. Check Verification Status (Polling)
  const { data: verificationData } = useQuery({
    queryKey: ["verification-status"],
    queryFn: getVerificationStatus,
    enabled: !!user && !tokenFromUrl && status !== "success",
    refetchInterval: 5000, // Har 5 second baad check kare
  });

  useEffect(() => {
    if (verificationData?.is_verified) {
      setStatus("success");
    }
  }, [verificationData]);

  // 3. Resend Email Mutation
  const resendMutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: () => {
      toast.success("Verification email sent again!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || "Failed to resend email.");
    },
  });

  const handleResend = () => {
    const emailToUse = user?.email;
    if (!emailToUse) {
      toast.error("Please login to resend verification email.");
      return;
    }
    resendMutation.mutate(emailToUse);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 pt-20">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-100">
        
        {/* --- State: Verifying --- */}
        {status === "verifying" && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Verifying...</h2>
            <p className="text-gray-500 mt-2">Checking your verification token.</p>
          </div>
        )}

        {/* --- State: Success --- */}
        {status === "success" && (
          <div>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
            <p className="text-gray-500 mt-2">Your account is now active.</p>
            <button 
              onClick={() => navigate("/dashboard")}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* --- State: Error (Link Expired/Invalid) --- */}
        {status === "error" && (
          <div>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600">Link Expired</h2>
            <p className="text-gray-500 mt-2">This verification link is invalid or has expired.</p>
            
            <button 
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="mt-6 bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 w-full transition"
            >
              {resendMutation.isPending ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        )}

        {/* --- State: Idle (User just signed up) --- */}
        {status === "idle" && (
          <div>
            <div className="text-6xl mb-4">📩</div>
            <h2 className="text-2xl font-bold text-gray-800">Verify your Email</h2>
            <p className="text-gray-500 mt-2">
              We've sent a link to <strong>{user?.email}</strong>.
              <br/>Please check your inbox (and spam folder).
            </p>
            
            <div className="mt-8 space-y-3">
              <button 
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                {resendMutation.isPending ? "Sending..." : "Resend Email"}
              </button>
              
              <button 
                onClick={() => navigate("/dashboard")}
                className="w-full text-gray-500 hover:text-gray-800 text-sm py-2"
              >
                I'll do this later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
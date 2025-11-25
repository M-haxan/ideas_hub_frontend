import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/auth";

// 1. Path update hua: /request-password-reset -> /auth/forgot-password
const requestPasswordReset = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

// 2. Naya function: Resend Email
const resendResetEmail = async (email) => {
  const { data } = await api.post("/auth/resend-reset-email", { email });
  return data;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false); // Track karnay ke liye

  // 'Forgot Password' mutation
  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset email sent!");
      setEmailSent(true); // Track karein ke email chala gaya hai
    },
    onError: (error) => {
      const err = error.response?.data?.detail || "Failed to send email";
      toast.error(err);
    },
  });

  // 3. 'Resend Email' mutation
  const resendMutation = useMutation({
    mutationFn: resendResetEmail,
    onSuccess: (data) => {
      toast.success(data.message || "Reset email sent again!");
    },
    onError: (error) => {
      const err = error.response?.data?.detail || "Failed to resend email";
      toast.error(err);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    mutation.mutate(email);
  };

  // 4. Resend handler
  const handleResend = () => {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }
    resendMutation.mutate(email);
  };

  return (
    <div className="flex items-start justify-center bg-gray-50 min-h-screen pt-28 pb-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl px-8 py-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Forgot Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={mutation.isPending || resendMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 rounded-lg font-medium transition duration-200 disabled:opacity-70"
          >
            {mutation.isPending ? "Sending..." : "Send Reset Link"}
          </button>

          {/* 5. Resend link/button */}
          {emailSent && (
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="text-blue-600 hover:underline disabled:opacity-70"
              >
                {resendMutation.isPending ? "Resending..." : "Didn't receive email? Resend"}
              </button>
            </div>
          )}

          <p className="text-sm text-center mt-3 text-gray-600">
            Remembered your password?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
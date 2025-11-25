import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/auth";

// ✅ FIX: Keys ab Backend Schema se match kar rahi hain
const resetPassword = async ({ token, password, confirmPassword }) => {
  const { data } = await api.post(`/auth/reset-password`, {
    token: token,
    new_password: password,        // Backend "new_password" maang raha hai
    confirm_password: confirmPassword // Backend "confirm_password" maang raha hai
  });
  return data;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL se token nikalein
  const token = searchParams.get("token"); 

  const [form, setForm] = useState({
    password: "",
    confirm: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
    }
  }, [token]);

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successfully!");
      navigate("/login");
    },
   onError: (error) => {
      console.error("Reset Error:", error.response?.data);
      
      const detail = error.response?.data?.detail;
      let errorMessage = "Failed to reset password.";

      if (Array.isArray(detail)) {
        // Agar array hai (Schema validation error)
        errorMessage = detail.map((err) => err.msg).join(", ");
      } else if (typeof detail === "string") {
        // Agar simple string hai
        errorMessage = detail;
      } else if (typeof detail === "object" && detail !== null) {
        // ✅ NEW: Agar detail ek object hai, to usay string bana lo
        // Aksar backend { "msg": "Token invalid" } bhejta hai
        errorMessage = detail.msg || detail.message || detail.error || JSON.stringify(detail);
      }

      toast.error(errorMessage);
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.password || !form.confirm) {
      toast.error("Please fill both fields");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!token) {
      toast.error("Missing token.");
      return;
    }

    // ✅ Mutation call mein ab dono passwords bhej rahe hain
    mutation.mutate({ 
      token, 
      password: form.password, 
      confirmPassword: form.confirm 
    });
  };

  if (!token) return <div className="text-center pt-20">Invalid Link (No Token Found)</div>;

  return (
    <div className="flex items-start justify-center bg-gray-50 min-h-screen pt-28 pb-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl px-8 py-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Set New Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="password"
            type="password"
            placeholder="New Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            name="confirm"
            type="password"
            placeholder="Confirm New Password"
            value={form.confirm}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 rounded-lg font-medium transition duration-200 disabled:opacity-70"
          >
            {mutation.isPending ? "Setting..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
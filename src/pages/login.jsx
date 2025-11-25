import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import Cookies from "js-cookie";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Mutation for login request
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("✅ Login success:", data);
      // Save tokens
      Cookies.set("access_token", data.access_token, { expires: 7 });
      Cookies.set("refresh_token", data.refresh_token, { expires: 7 });
      
      // User state update karein
      setAuthenticated(true, data.user); 

      toast.success("Logged in successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("❌ Login error:", error.response?.data);
      const err =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Login failed";
      toast.error(err);
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="flex items-start justify-center bg-gray-50 min-h-screen pt-28 pb-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl px-8 py-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Login to <span className="font-semibold text-blue-600">Ideas Hub</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-gray-300"></span>
            <span className="relative bg-white px-4 text-sm text-gray-500">OR</span>
          </div>

          {/* ✅ FIX: Anchor tag use kiya hai jo direct backend par redirect karega */}
          <a
            href="https://ideas-hub-1.onrender.com/auth/google/login"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 text-center cursor-pointer"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Sign in with Google</span>
          </a>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 rounded-lg font-medium transition duration-200 disabled:opacity-70"
          >
            {mutation.isPending ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-sm text-center mt-3 text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
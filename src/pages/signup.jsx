import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export default function SignupPage() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore(); // ✅ inside the component now

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });


  const mutation = useMutation({
    mutationFn: signupUser,
   onSuccess: (data) => {
  Cookies.set("access_token", data.access_token, { expires: 7 });
  Cookies.set("refresh_token", data.refresh_token, { expires: 7 });

  // --- YEH LINE CHANGE KAREIN ---
  // Hum assume kar rahay hain backend 'data.user' object bhej raha hai
  setAuthenticated(true, data.user);
  // -----------------------------
  
  toast.success("Account created successfully!");
  navigate("/dashboard");
},
    onError: (error) => {
      console.error("❌ Signup error:", error.response?.data);
      const err =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Signup failed";
      alert(err);
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      alert("Passwords do not match");
      return;
    }

    if (!form.email || !form.password || !form.name) {
      alert("Please fill all fields");
      return;
    }

    // Send signup data
    mutation.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
    });
  };

  return (
    <div className="flex items-start justify-center bg-gray-50 min-h-screen pt-28 pb-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl px-8 py-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Create an Account
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Join <span className="font-semibold text-blue-600">Ideas Hub</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
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
          <input
            name="confirm"
            type="password"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-gray-300"></span>
            <span className="relative bg-white px-4 text-sm text-gray-500">OR</span>
          </div>

          <a
            href="https://ideas-hub-1.onrender.com/auth/google/login"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Sign up with Google</span>
          </a>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 rounded-lg font-medium transition duration-200 disabled:opacity-70"
          >
            {mutation.isPending ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-sm text-center mt-3 text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

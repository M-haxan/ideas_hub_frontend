// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { Toaster } from "react-hot-toast";

// import Navbar from "./components/navbar";
// import DashboardPage from "./pages/dashboard";
// import CreateIdea from "./pages/ideas/CreateIdea";
// import EditIdea from "./pages/ideas/EditIdea";
// import IdeaList from "./pages/ideas/IdeaList";
// import IdeaDetail from "./pages/ideas/IdeaDetail";
// import LoginPage from "./pages/login";
// import SignupPage from "./pages/signup";
// import ForgotPasswordPage from "./pages/ForgotPassword";
// import ResetPasswordPage from "./pages/ResetPassword";
// import Home from "./pages/Home";
// import ProtectedRoute from "./components/ProtectedRoute";
// import AuthCallback from "./pages/AuthCallback"; // Google Login Callback

// import { useAuthStore } from "./store/authStore";
// import { getMe } from "./api/users"; // ✅ Sahi Import Path

// function App() {
//   const { setAuthenticated, logout } = useAuthStore();
//   const [isCheckingSession, setIsCheckingSession] = useState(true);

//   useEffect(() => {
//     const checkUserSession = async () => {
//       try {
//         // Backend se check karein k user logged in hai ya nahi
//         const userData = await getMe();
//         if (userData) {
//           setAuthenticated(true, userData);
//         } else {
//           logout();
//         }
//       } catch (error) {
//         // Agar 401 error aaye, matlab session nahi hai
//         console.log("No valid session on load.");
//         logout();
//       } finally {
//         setIsCheckingSession(false);
//       }
//     };

//     checkUserSession();
//   }, [setAuthenticated, logout]);

//   if (isCheckingSession) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p>Loading application...</p>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <Toaster position="top-right" />
//       <Navbar />
//       <main className="flex-grow">
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//           <Route path="/reset-password" element={<ResetPasswordPage />} />
          
//           {/* Google Login Callback Route */}
//           <Route path="/auth/callback" element={<AuthCallback />} />

//           {/* Protected Routes */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//           />
          
//           {/* ✅ Routes ko wapis puranay names par set kiya hai taa ke Navbar kaam kare */}
//           <Route
//             path="/CreateIdea"
//             element={
//               <ProtectedRoute>
//                 <CreateIdea />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/IdeaList"
//             element={
//               <ProtectedRoute>
//                 <IdeaList />
//               </ProtectedRoute>
//             }
//           />
//           {/* hum /feed ko bhi idea list par bhej rahay hain */}
//           <Route path="/feed" element={<IdeaList />} />

//           <Route
//             path="/EditIdea/:id"
//             element={
//               <ProtectedRoute>
//                 <EditIdea />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/IdeaDetail/:id"
//             element={
//               <ProtectedRoute>
//                 <IdeaDetail />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/profile"
//             element={
//               <ProtectedRoute>
//                 <div>Profile Page (Coming Soon)</div>
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </main>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/navbar";
import DashboardPage from "./pages/dashboard";
import CreateIdea from "./pages/ideas/CreateIdea";
import EditIdea from "./pages/ideas/EditIdea";
import IdeaList from "./pages/ideas/IdeaList";
import IdeaDetail from "./pages/ideas/IdeaDetail";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback"; // Google Login Callback
import VerifyEmailPage from "./pages/VerifyEmail";

import { useAuthStore } from "./store/authStore";
import { getMe } from "./api/auth";

function App() {
  const { setAuthenticated, logout } = useAuthStore();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userData = await getMe();
        if (userData) {
          setAuthenticated(true, userData);
        } else {
          logout();
        }
      } catch (error) {
        console.log("No valid session on load.");
        logout();
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkUserSession();
  }, [setAuthenticated, logout]);

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* === Public Routes === */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
          {/* === Protected Routes === */}
          
          {/* 1. Dashboard */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />

          {/* 2. Ideas List (Feed) - Both New & Old Paths */}
          <Route
            path="/ideas" // New Path (Navbar/Dashboard se)
            element={<ProtectedRoute><IdeaList /></ProtectedRoute>}
          />
          <Route
            path="/IdeaList" // Old Path (Backup)
            element={<ProtectedRoute><IdeaList /></ProtectedRoute>}
          />
           <Route
            path="/feed" // Old Path (Home se)
            element={<ProtectedRoute><IdeaList /></ProtectedRoute>}
          />

          {/* 3. Create Idea - Both New & Old Paths */}
          <Route
            path="/ideas/create" // New Path
            element={<ProtectedRoute><CreateIdea /></ProtectedRoute>}
          />
          <Route
            path="/CreateIdea" // Old Path
            element={<ProtectedRoute><CreateIdea /></ProtectedRoute>}
          />

          {/* 4. View Idea Detail - Both New & Old Paths */}
          <Route
            path="/ideas/:id" // New Path
            element={<ProtectedRoute><IdeaDetail /></ProtectedRoute>}
          />
          <Route
            path="/IdeaDetail/:id" // Old Path (IdeaList se linked)
            element={<ProtectedRoute><IdeaDetail /></ProtectedRoute>}
          />

          {/* 5. Edit Idea - Both New & Old Paths */}
          <Route
            path="/ideas/edit/:id" // New Path
            element={<ProtectedRoute><EditIdea /></ProtectedRoute>}
          />
          <Route
            path="/EditIdea/:id" // Old Path
            element={<ProtectedRoute><EditIdea /></ProtectedRoute>}
          />

          {/* 6. Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="pt-20 text-center">Profile Page Coming Soon</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Share Your Next <span className="text-blue-600">Big Idea</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Ideas Hub is the platform for innovators to share, collaborate, and gather feedback on their projects. Join a community of creators today.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/signup"
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:-translate-y-1"
              >
                Get Started for Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-blue-600 border border-blue-200 rounded-full font-semibold text-lg shadow-sm hover:bg-gray-50 transition"
              >
                Log In
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Share Ideas</h3>
            <p className="text-gray-600">
              Post your project concepts easily using our markdown editor and get instant visibility.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Collaborate</h3>
            <p className="text-gray-600">
              Connect with other developers and innovators. Get feedback to refine your vision.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Grow</h3>
            <p className="text-gray-600">
              Take your idea from "Seed" stage to "Growth" with community support and voting.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center py-20 px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to innovate?</h2>
        <Link
          to="/feed"
          className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
        >
          Explore Public Feed
        </Link>
      </div>
    </div>
  );
}
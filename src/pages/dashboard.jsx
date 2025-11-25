import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Hello, <span className="text-blue-600">{user?.name || "Innovator"}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-2">Here is what's happening with your projects today.</p>
        </div>

        {/* Stats Row (Placeholder for now) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-sm font-medium uppercase">Total Ideas</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">-</p>
            <p className="text-xs text-green-500 mt-1">Start creating today</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-gray-400 text-sm font-medium uppercase">Community Votes</h3>
             <p className="text-4xl font-bold text-gray-800 mt-2">-</p>
             <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-gray-400 text-sm font-medium uppercase">Feedback Received</h3>
             <p className="text-4xl font-bold text-gray-800 mt-2">-</p>
             <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Card */}
          <Link
            to="/ideas/create"
            className="group relative bg-gradient-to-br from-blue-600 to-blue-500 p-8 rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">🚀 Launch New Idea</h3>
              <p className="text-blue-100">Draft a new proposal and share it with the world.</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
              <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
            </div>
          </Link>

          {/* Browse Feed Card */}
          <Link
            to="/ideas"
            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition"
          >
             <h3 className="text-2xl font-bold text-gray-800 mb-2">🌍 Browse Feed</h3>
             <p className="text-gray-500">See what others are building and give feedback.</p>
          </Link>
        </div>

        {/* Profile Link (Small) */}
        <div className="mt-6 text-center">
           <Link to="/profile" className="text-sm text-gray-500 hover:text-blue-600 underline">Manage your Profile settings</Link>
        </div>
      </div>
    </div>
  );
}
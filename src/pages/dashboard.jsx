import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import api from "../api/auth";
import FeedPost from "../components/FeedPost";

const fetchIdeas = async () => {
  const { data } = await api.get("/ideas");
  return data.items || data.data || [];
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: allIdeas, isLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: fetchIdeas,
  });

  // ✅ FILTER FIXED: 
  // Backend ID nahi bhej raha, lekin 'can_edit' flag bhej raha hai.
  // Agar 'can_edit' true hai, matlab yeh MERI post hai.
  const myIdeas = allIdeas?.filter((idea) => idea.can_edit === true) || [];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 pt-24">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Stats */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, <span className="text-blue-600">{user?.name}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-2">Manage your personal projects and track progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-sm font-medium uppercase">My Posts</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">{myIdeas.length}</p>
          </div>
        </div>

        {/* --- MY POSTS SECTION --- */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Ideas & Posts</h2>
          <Link
            to="/ideas/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + New Idea
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading your ideas...</div>
        ) : myIdeas.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {myIdeas.map((idea) => (
              <FeedPost key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">You haven't posted anything yet.</p>
            <Link to="/ideas/create" className="text-blue-600 font-medium hover:underline">
              Create your first post &rarr;
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
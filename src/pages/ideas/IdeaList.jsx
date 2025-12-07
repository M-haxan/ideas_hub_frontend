import React from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate added
import { useQuery } from "@tanstack/react-query";
import api from "../../api/auth";
import FeedPost from "../../components/FeedPost";

const fetchIdeas = async () => {
  const { data } = await api.get("/ideas");
  return data.items;
};

export default function IdeaList() {
  const navigate = useNavigate(); // ✅ Hook
  const { data: ideas, isLoading, isError, error } = useQuery({
    queryKey: ["ideas"],
    queryFn: fetchIdeas,
  });

  if (isLoading) return (
    <div className="pt-24 flex justify-center min-h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isError) return (
    <div className="pt-24 text-center px-4 min-h-screen bg-gray-100">
      <h2 className="text-xl font-bold text-red-600">Error loading feed</h2>
      <p className="text-gray-500 mt-2">{error.message}</p>
    </div>
  );

  return (
    <div className="pt-24 pb-10 px-4 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto">
        
        {/* ✅ NEW: Visible Back Button */}
        <button 
          onClick={() => navigate("/dashboard")} 
          className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition shadow-sm flex items-center gap-2 font-medium"
        >
          &larr; Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Home Feed</h1>
          <Link
            to="/ideas/create"
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 shadow-md transition transform hover:scale-105"
          >
            + Create Post
          </Link>
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          {ideas && ideas.length > 0 ? (
            ideas.map((idea) => (
              <FeedPost key={idea.id} idea={idea} />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-lg">No posts yet. Be the first!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/auth";
import FeedPost from "../../components/FeedPost";

const fetchIdeas = async () => {
  const { data } = await api.get("/ideas");
  return data.items || data.data || [];
};

export default function IdeaList() {
  const navigate = useNavigate();

  const { data: ideas, isLoading, isError, error } = useQuery({
    queryKey: ["ideas"],
    queryFn: fetchIdeas,
  });

  // ✅ FILTER FIXED: Sirf Dusron Ki Posts (Public Feed)
  // Logic: Agar main ise edit nahi kar sakta (!can_edit), to ye kisi aur ki post hai.
  const feedIdeas = ideas?.filter((idea) => !idea.can_edit) || [];

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
        
        <button 
          onClick={() => navigate("/dashboard")} 
          className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition shadow-sm flex items-center gap-2 font-medium"
        >
          &larr; Go to My Dashboard
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Public Feed</h1>
            <p className="text-sm text-gray-500">Explore ideas from other innovators</p>
          </div>
          <Link
            to="/ideas/create"
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 shadow-md transition transform hover:scale-105"
          >
            + Create
          </Link>
        </div>

        <div className="space-y-4">
          {feedIdeas.length > 0 ? (
            feedIdeas.map((idea) => (
              <FeedPost key={idea.id} idea={idea} />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-lg">No posts from others yet.</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to invite friends!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/auth";

// Yeh function waisay hi rahay ga (yeh sahi hai)
const fetchIdeas = async () => {
  const { data } = await api.get("/ideas");
  return data.items;
};

export default function IdeaList() {
  const {
    data: ideas,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ideas"],
    queryFn: fetchIdeas,
  });

  if (isLoading) {
    return (
      <div className="pt-20 px-6 bg-gray-50 min-h-screen text-center">
        <p className="text-lg">Loading ideas...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-20 px-6 bg-gray-50 min-h-screen text-center text-red-600">
        <h2 className="text-lg font-semibold">Error</h2>
        <p>{error.response?.data?.detail || error.message}</p>
        <p>Could not fetch ideas from the server.</p>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Ideas</h1>
        <Link
          to="/CreateIdea"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Idea
        </Link>
      </div>

      <div className="grid gap-4">
        {ideas && ideas.length > 0 ? (
          ideas.map((idea) => (
            <Link
              key={idea.id}
              to={`/IdeaDetail/${idea.id}`}
              className="block bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              {/* ===== YEH LINE CHANGE HUI HAI ===== */}
              {/* Hum ne 'idea.title' ko 'idea.current_version.title' kar diya hai */}
              <h2 className="text-lg font-medium">
                {idea.current_version.title}
              </h2>
              {/* ================================== */}

              <p className="text-sm text-gray-500">Stage: {idea.stage}</p>
              <p className="text-sm text-gray-500">
                Likes: {idea.likes_count || 0}
              </p>
            </Link>
          ))
        ) : (
          <div className="bg-white p-6 rounded-xl shadow text-center text-gray-600">
            <p>No ideas found. Be the first one to create a new idea!</p>
          </div>
        )}
      </div>
    </div>
  );
}
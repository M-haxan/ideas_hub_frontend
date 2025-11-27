import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import api from "../../api/auth"; // Main API
import { toggleReaction } from "../../api/interactions"; // New Interaction API
import toast from "react-hot-toast";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const fetchIdeas = async () => {
  const { data } = await api.get("/ideas");
  return data.items;
};

export default function IdeaList() {
  const queryClient = useQueryClient();

  // 1. Fetch Ideas
  const { data: ideas, isLoading, isError, error } = useQuery({
    queryKey: ["ideas"],
    queryFn: fetchIdeas,
  });

  // 2. Vote Mutation
  const voteMutation = useMutation({
    mutationFn: toggleReaction,
    onSuccess: () => {
      // Vote hone k baad list ko refresh karein taa ke like count update ho
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Reaction updated!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to vote. Try again.");
    }
  });

  const handleVote = (postId) => {
    voteMutation.mutate(postId);
  };

  if (isLoading) return <div className="pt-24 text-center">Loading feed...</div>;
  if (isError) return <div className="pt-24 text-center text-red-500">{error.message}</div>;

  return (
    <div className="pt-20 pb-10 px-4 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Community Feed</h1>
          <Link to="/ideas/create" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 shadow-md transition">
            + Create Post
          </Link>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {ideas && ideas.length > 0 ? (
            ideas.map((idea) => (
              <div key={idea.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200">
                
                {/* User Info */}
                <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {(idea.author?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {idea.author?.name || "Anonymous"}
                    </h3>
                    <p className="text-xs text-gray-500">{formatDate(idea.created_at)}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <Link to={`/ideas/${idea.id}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition">
                      {idea.current_version.title}
                    </h2>
                  </Link>
                  
                  <div className="prose prose-sm max-w-none text-gray-700 mb-4 line-clamp-3">
                    <ReactMarkdown>{idea.current_version.body_md}</ReactMarkdown>
                  </div>

                  {idea.current_version.attachments?.[0] && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <img src={idea.current_version.attachments[0]} alt="Post" className="w-full h-auto object-cover max-h-96" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-6">
                  {/* Like Button */}
                  <button 
                    onClick={() => handleVote(idea.id)}
                    disabled={voteMutation.isPending}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition group"
                  >
                    <span className="text-xl group-hover:scale-110 transition">
                      {/* Agar user ne like kia hai to ❤️ warna 🤍 (Backend se field ani chahiye) */}
                      ❤️
                    </span>
                    <span className="text-sm font-medium">{idea.likes_count || 0} Likes</span>
                  </button>

                  {/* Comment Button (Navigates to Detail) */}
                  <Link to={`/ideas/${idea.id}`} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition group">
                    <span className="text-xl group-hover:scale-110 transition">💬</span>
                    <span className="text-sm font-medium">{idea.comments_count || 0} Comments</span>
                  </Link>
                </div>

              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No posts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
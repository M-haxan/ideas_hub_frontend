import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/auth"; // Main Backend
import { getComments, addComment, deleteComment, toggleReaction } from "../../api/interactions"; // New Backend
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore"; // Current User check krne k liye

// Fetch Idea
const fetchIdeaById = async (id) => {
  const { data } = await api.get(`/ideas/${id}`);
  return data;
};

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState("");

  // 1. Fetch Idea
  const { data: idea, isLoading: ideaLoading } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => fetchIdeaById(id),
  });

  // 2. Fetch Comments (From new backend)
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments(id),
    enabled: !!id, // Id ho to hi fetch karein
  });

  // --- Mutations ---

  // Add Comment
  const commentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      toast.success("Comment added!");
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: () => toast.error("Failed to add comment"),
  });

  // Delete Comment
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  // Vote Idea
  const voteMutation = useMutation({
    mutationFn: () => toggleReaction(id),
    onSuccess: () => {
      toast.success("Reaction updated!");
      queryClient.invalidateQueries({ queryKey: ["idea", id] }); // Idea refresh karein taa ke like count update ho
    },
  });

  const handleDeleteIdea = async () => {
    if (window.confirm("Delete this idea?")) {
      try {
        await api.delete(`/ideas/${id}`);
        toast.success("Idea deleted");
        navigate("/ideas");
      } catch (e) { toast.error("Failed delete"); }
    }
  };

  if (ideaLoading) return <div className="pt-20 text-center">Loading post...</div>;

  return (
    <div className="pt-20 px-4 bg-gray-50 min-h-screen pb-10">
      <div className="max-w-3xl mx-auto">
        
        {/* --- Main Post Card --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {idea.current_version.title}
            </h1>
            {/* Show Edit/Delete only if current user is owner (Assuming user.id match) */}
            {user?.id === idea.author_id && (
              <div className="flex gap-2">
                <Link to={`/ideas/edit/${id}`} className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-sm">Edit</Link>
                <button onClick={handleDeleteIdea} className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 text-sm">Delete</button>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-6">
            <ReactMarkdown>{idea.current_version.body_md}</ReactMarkdown>
          </div>

          {/* Like Button */}
          <button 
            onClick={() => voteMutation.mutate()} 
            disabled={voteMutation.isPending}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition"
          >
            <span>👍</span>
            <span className="font-bold">{idea.likes_count || 0} Likes</span>
          </button>
        </div>

        {/* --- Comments Section --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-4">Comments</h3>

          {/* Comment Input */}
          <div className="flex gap-2 mb-6">
            <input 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={() => commentMutation.mutate({ postId: id, text: commentText })}
              disabled={!commentText.trim() || commentMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Post
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {commentsLoading ? <p>Loading comments...</p> : comments.length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id || c._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                  <div>
                    <p className="text-gray-800">{c.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      By {c.author_name || "User"}
                    </p>
                  </div>
                  
                  {/* Delete Comment (Only if owner) */}
                  {user?.id === c.author_id && (
                    <button 
                      onClick={() => deleteCommentMutation.mutate(c.id || c._id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
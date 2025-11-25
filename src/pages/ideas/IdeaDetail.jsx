import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/auth";
import toast from "react-hot-toast";

// --- API Functions ---

// 1. Fetch Idea
const fetchIdeaById = async (id) => {
  const { data } = await api.get(`/ideas/${id}`);
  return data;
};

// 2. Delete Idea
const deleteIdea = async (id) => {
  const { data } = await api.delete(`/ideas/${id}`);
  return data;
};

// 3. Vote/Like API (Backend se endpoint confirm kar lena, abhi standard assume kia hai)
const voteIdea = async (id) => {
  const { data } = await api.post(`/ideas/${id}/vote`); 
  return data;
};

// 4. Post Comment API
const postComment = async ({ id, text }) => {
  // Backend usually expects { "text": "some comment" } or similar
  const { data } = await api.post(`/ideas/${id}/comments`, { text });
  return data;
};

// 5. Fetch Comments API
const fetchComments = async (id) => {
  try {
    const { data } = await api.get(`/ideas/${id}/comments`);
    return data; // Expecting array of comments
  } catch (err) {
    console.log("Comments fetch error (API might not be ready):", err);
    return []; // Return empty array if failed
  }
};

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Comment box state
  const [commentText, setCommentText] = useState("");

  // Queries
  const { data: idea, isLoading, isError, error } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => fetchIdeaById(id),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => fetchComments(id),
    enabled: !!idea, // Sirf tab fetch kare jab idea load ho chuka ho
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteIdea,
    onSuccess: () => {
      toast.success("Idea deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      navigate("/IdeaList");
    },
    onError: (error) => toast.error(error.response?.data?.detail || "Failed to delete"),
  });

  const voteMutation = useMutation({
    mutationFn: () => voteIdea(id),
    onSuccess: () => {
      toast.success("Voted successfully!");
      queryClient.invalidateQueries({ queryKey: ["idea", id] }); // Refresh UI to show new vote count
    },
    onError: (error) => toast.error("Failed to vote"),
  });

  const commentMutation = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      toast.success("Comment posted!");
      setCommentText(""); // Clear input
      queryClient.invalidateQueries({ queryKey: ["comments", id] }); // Refresh comments list
    },
    onError: (error) => toast.error("Failed to post comment"),
  });

  // Handlers
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this idea?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleVote = () => {
    voteMutation.mutate();
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate({ id, text: commentText });
  };

  if (isLoading) return <div className="pt-20 text-center">Loading...</div>;
  if (isError) return <div className="pt-20 text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="pt-20 px-6 bg-gray-50 min-h-screen max-w-3xl mx-auto pb-10">
      <div className="bg-white p-6 rounded-xl shadow">
        {/* Header & Buttons */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {idea.current_version?.title || idea.title}
          </h1>
          <div className="flex space-x-2">
            <Link to={`/EditIdea/${id}`} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
              Edit
            </Link>
            <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">
              Delete
            </button>
          </div>
        </div>

        {/* Summary */}
        <p className="text-gray-600 mb-6 text-lg border-l-4 border-blue-500 pl-4 italic">
          {idea.current_version?.short_summary}
        </p>

        {/* Body (Markdown) */}
        <div className="prose max-w-none mb-8">
          <ReactMarkdown>{idea.current_version?.body_md}</ReactMarkdown>
        </div>

        {/* Metadata & Vote Button */}
        <div className="flex items-center justify-between border-t pt-4 mt-6">
          <div className="flex gap-2">
            {idea.tags?.map((tag) => (
              <span key={tag} className="bg-gray-200 px-2 py-1 rounded text-xs text-gray-700">#{tag}</span>
            ))}
          </div>
          
          {/* Vote Button */}
          <button 
            onClick={handleVote} 
            disabled={voteMutation.isPending}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition"
          >
            <span>👍</span>
            <span className="font-bold">{idea.likes_count || 0} Votes</span>
          </button>
        </div>
      </div>

      {/* --- Comments Section --- */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Comments ({comments.length})</h3>
        
        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <textarea
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="text-right mt-2">
            <button 
              type="submit" 
              disabled={commentMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {commentMutation.isPending ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-800">{comment.text || comment.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  By {comment.author_name || "User"} on {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>
    </div>
  );
}
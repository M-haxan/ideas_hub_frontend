import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComments, addComment, castVote, getReactions } from "../api/interactions";
import api from "../api/auth";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

export default function FeedPost({ idea }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showComments, setShowComments] = useState(false);
  const [commentBody, setCommentBody] = useState("");

  const { data: reactionData } = useQuery({
    queryKey: ["reactions", idea.id],
    queryFn: () => getReactions(idea.id),
    refetchInterval: 10000, 
  });
  const likeCount = reactionData?.likes ?? reactionData?.like_count ?? 0;

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", idea.id],
    queryFn: () => getComments({ idea_id: idea.id }),
    enabled: showComments, 
  });

  const comments = Array.isArray(commentsData) ? commentsData : (commentsData?.comments || []);

  const voteMutation = useMutation({
    mutationFn: () => castVote({ target_id: idea.id, value: 1 }),
    onSuccess: () => {
      toast.success("Voted!");
      queryClient.invalidateQueries({ queryKey: ["reactions", idea.id] });
    },
    onError: () => toast.error("Failed to vote")
  });

  const commentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      toast.success("Comment posted!");
      setCommentBody("");
      queryClient.invalidateQueries({ queryKey: ["comments", idea.id] });
    },
    onError: () => toast.error("Failed to post comment")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/ideas/${id}`),
    onSuccess: () => {
      toast.success("Idea deleted!");
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to delete idea"),
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this idea permanently?")) {
      deleteMutation.mutate(id);
    }
  };

  const getImageUrl = () => {
    if (idea.current_version?.attachments?.length > 0) {
      return idea.current_version.attachments[0];
    }
    if (idea.attachments?.length > 0) {
      return idea.attachments[0];
    }
    return null;
  };

  const imageUrl = getImageUrl();

  // ✅ PERMISSIONS CHECK (Robust Logic)
  // Step 1: Check agar Backend 'can_edit' flag bhej raha hai
  // Step 2: Agar nahi, to 'author_id' match kar ke check karo
  
  const postAuthorId = idea.author_id || idea.author?.id || idea.user_id;
  
  const canEdit = idea.can_edit ?? (user?.id === postAuthorId);
  const canDelete = idea.can_delete ?? (user?.id === postAuthorId);

  // Debugging (Console mein confirm kar lein k permissions true hain ya false)
  // useEffect(() => {
  //   if (user) console.log(`Post ${idea.id} Permissions:`, { canEdit, canDelete, postAuthorId });
  // }, [user, idea]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 hover:shadow-md transition duration-200">
      
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
          {(idea.author?.name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {idea.author?.name || "Anonymous User"}
          </h3>
          <p className="text-xs text-gray-500">{formatDate(idea.created_at)} • {idea.stage}</p>
        </div>
        
        <div className="flex items-center gap-2">
            {/* View Details - Always Show */}
            <Link 
            to={`/ideas/${idea.id}`}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-medium transition"
            >
            Details ↗
            </Link>
            
            {/* ✅ Edit Button (Conditional) */}
            {canEdit && (
                <Link 
                to={`/ideas/edit/${idea.id}`}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium transition"
                >
                Edit
                </Link>
            )}
            
            {/* ✅ Delete Button (Conditional) */}
            {canDelete && (
                <button
                onClick={() => handleDelete(idea.id)}
                disabled={deleteMutation.isPending}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium transition disabled:opacity-50"
                >
                {deleteMutation.isPending ? "..." : "Delete"}
                </button>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
          {idea.current_version?.title || idea.title}
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {idea.tags?.map((tag, idx) => (
            <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">#{tag}</span>
          ))}
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 mb-3 line-clamp-3">
          <ReactMarkdown>{idea.current_version?.body_md || idea.body_md}</ReactMarkdown>
        </div>

        {/* Image Display */}
        {imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 bg-black flex justify-center items-center">
            <img 
              src={imageUrl} 
              alt="Post attachment" 
              className="w-full h-auto max-h-[500px] object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <button 
          onClick={() => voteMutation.mutate()}
          disabled={voteMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition"
        >
          <span>👍</span>
          <span className="text-sm font-medium">{likeCount} Likes</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${showComments ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
        >
          <span>💬</span>
          <span className="text-sm font-medium">Comments</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50 p-4 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex gap-2 mb-4">
            <input 
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={() => commentMutation.mutate({ idea_id: idea.id, body: commentBody })}
              disabled={!commentBody.trim() || commentMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Post
            </button>
          </div>

          <div className="space-y-3">
            {commentsLoading ? (
              <p className="text-center text-xs text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-xs text-gray-500">No comments yet.</p>
            ) : (
              comments.map((c, idx) => (
                <div key={c._id || c.id || idx} className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {(c.author_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-900 mb-0.5">{c.author_name || "User"}</p>
                    <p className="text-sm text-gray-800">{c.body || c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-4">
             <Link to={`/ideas/${idea.id}`} className="text-xs text-gray-500 hover:text-blue-600 hover:underline">
               View all comments & replies on Detail Page
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
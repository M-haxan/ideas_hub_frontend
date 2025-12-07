import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/auth";
import { getComments, addComment, deleteComment, castVote, getReactions } from "../../api/interactions";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

const fetchIdeaById = async (id) => {
  try {
    const { data } = await api.get(`/ideas/${id}`);
    return data;
  } catch (error) {
    throw new Error("Idea not found");
  }
};

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentBody, setCommentBody] = useState("");

  const { data: idea, isLoading: ideaLoading, isError } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => fetchIdeaById(id),
    retry: 1,
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments({ idea_id: id }),
    enabled: !!id,
  });

  const { data: reactionData } = useQuery({
    queryKey: ["reactions", id],
    queryFn: () => getReactions(id),
    enabled: !!id,
    refetchInterval: 5000, 
  });

  const comments = Array.isArray(commentsData) ? commentsData : (commentsData?.comments || commentsData?.items || []);
  const likeCount = reactionData?.likes ?? reactionData?.like_count ?? reactionData?.count ?? 0;

  const commentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      toast.success("Comment added!");
      setCommentBody("");
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["comments", id] }), 500);
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to add comment"),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  const voteMutation = useMutation({
    mutationFn: () => castVote({ target_id: id, value: 1 }),
    onSuccess: () => {
      toast.success("Voted successfully!");
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["reactions", id] }), 200);
    },
    onError: (err) => toast.error("Failed to vote"),
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

  if (ideaLoading) return <div className="pt-24 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  if (isError || !idea) return (
    <div className="pt-24 text-center px-4">
      <h2 className="text-xl font-bold text-red-600">Post Not Found</h2>
      <button onClick={() => navigate("/ideas")} className="text-blue-600 hover:underline mt-4 block mx-auto">
        &larr; Back to Feed
      </button>
    </div>
  );

  return (
    <div className="pt-24 px-4 bg-gray-50 min-h-screen pb-10">
      <div className="max-w-3xl mx-auto">
        
        {/* ✅ Navigation Back Button */}
      <button 
          onClick={() => navigate(-1)} 
          className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition shadow-sm flex items-center gap-2 font-medium"
        >
          &larr; Back
        </button>

        {/* Post Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{idea.current_version?.title}</h1>
            {user?.id === idea.author_id && (
              <div className="flex gap-2 ml-4">
                <Link to={`/ideas/edit/${id}`} className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-sm">Edit</Link>
                <button onClick={handleDeleteIdea} className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 text-sm">Delete</button>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-6 text-gray-700">
            <ReactMarkdown>{idea.current_version?.body_md}</ReactMarkdown>
          </div>

          {idea.current_version?.attachments?.map((url, idx) => (
             <img key={idx} src={url} alt="Attachment" className="rounded-lg mb-4 max-h-96 w-full object-cover" />
          ))}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button 
              onClick={() => voteMutation.mutate()} 
              disabled={voteMutation.isPending}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition text-gray-700 font-medium group"
            >
              <span className="group-hover:scale-110 transition">👍</span>
              <span>{likeCount} Votes</span> 
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">
            Comments ({comments.length})
          </h3>

          <div className="flex gap-3 mb-8">
            <input 
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={() => commentMutation.mutate({ idea_id: id, body: commentBody })}
              disabled={!commentBody.trim() || commentMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {commentMutation.isPending ? "Posting..." : "Post"}
            </button>
          </div>

          <div className="space-y-4">
            {commentsLoading ? (
              <div className="text-center py-4">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500">No comments yet.</p>
              </div>
            ) : (
              comments.map((c, idx) => (
                <div key={c.id || c._id || idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {c.author?.name || c.author_name || "User"}
                      </span>
                      {c.created_at && (
                        <span className="text-xs text-gray-400">
                          • {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">{c.body || c.text}</p>
                  </div>
                  {(user?.role === 'admin' || user?.id === c.author_id) && (
                    <button onClick={() => deleteCommentMutation.mutate(c.id || c._id)} className="text-gray-400 hover:text-red-600 p-1">🗑️</button>
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
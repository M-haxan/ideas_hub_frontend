import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/auth";
import { getComments, addComment, deleteComment, castVote, getReactions } from "../../api/interactions";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

// --- Recursive Comment Item (Smart Component) ---
const CommentItem = ({ comment, user, onDelete, submitReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  const parentId = comment.id || comment._id;

  // ✅ Fetch Replies
  const { data: repliesData, isLoading: repliesLoading, isError: replyError, error: replyErrorDetail } = useQuery({
    queryKey: ["comments", "replies", parentId],
    queryFn: () => getComments({ parent_id: parentId }),
    enabled: showReplies,
  });

  // 🕵️‍♂️ DEBUG LOGS FOR REPLIES
  useEffect(() => {
    if (showReplies) {
      console.log(`🔵 [Frontend] Fetching replies for Parent ID: ${parentId}`);
    }
    if (repliesData) {
      console.log(`🟢 [Backend] Replies Response for ${parentId}:`, repliesData);
      if (repliesData.comments?.length === 0) {
        console.warn(`⚠️ [Issue] Backend returned 0 replies for ${parentId} (Check Database)`);
      }
    }
    if (replyError) {
      console.error(`❌ [Error] Failed to fetch replies for ${parentId}:`, replyErrorDetail);
    }
  }, [showReplies, repliesData, replyError, parentId]);

  const replies = repliesData?.comments || [];

  const handleReplySubmit = () => {
    if (!replyBody.trim()) return;
    submitReply(parentId, replyBody);
    setReplyBody("");
    setIsReplying(false);
    setShowReplies(true);
  };

  return (
    <div className="flex gap-3 mb-4 animate-in fade-in slide-in-from-top-1">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
          {(comment.author?.name || comment.author_name || "U").charAt(0).toUpperCase()}
        </div>
        {showReplies && replies.length > 0 && <div className="w-px h-full bg-gray-200 my-2"></div>}
      </div>

      <div className="flex-1">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex justify-between items-start">
            <span className="font-semibold text-sm text-gray-900">
              {comment.author?.name || comment.author_name || "User"}
            </span>
            <span className="text-xs text-gray-400">
              {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : "Just now"}
            </span>
          </div>
          <p className="text-gray-700 text-sm mt-1">{comment.body || comment.text}</p>
        </div>

        <div className="flex gap-4 mt-1 ml-1 text-xs text-gray-500 font-medium items-center">
          <button onClick={() => setIsReplying(!isReplying)} className="hover:text-blue-600 transition">Reply</button>
          
          {(user?.role === 'admin' || user?.id === comment.author_id) && (
            <button onClick={() => onDelete(parentId)} className="hover:text-red-600 transition">Delete</button>
          )}

          {comment.children_count > 0 && (
            <button 
              onClick={() => setShowReplies(!showReplies)} 
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {showReplies ? "Hide Replies" : `View ${comment.children_count} Replies`}
            </button>
          )}
        </div>

        {isReplying && (
          <div className="mt-2 flex gap-2">
            <input 
              autoFocus 
              value={replyBody} 
              onChange={(e) => setReplyBody(e.target.value)} 
              placeholder="Write a reply..." 
              className="flex-1 border rounded px-3 py-1 text-sm outline-none" 
            />
            <button 
              onClick={handleReplySubmit} 
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              Send
            </button>
          </div>
        )}

        {showReplies && (
          <div className="mt-3">
            {repliesLoading ? (
              <div className="text-xs text-gray-400">Loading replies...</div>
            ) : (
              replies.map((child) => (
                <CommentItem 
                  key={child.id || child._id} 
                  comment={child} 
                  user={user} 
                  onDelete={onDelete} 
                  submitReply={submitReply} 
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const fetchIdeaById = async (id) => {
  const { data } = await api.get(`/ideas/${id}`);
  return data;
};

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [mainCommentBody, setMainCommentBody] = useState("");

  const { data: idea, isLoading: ideaLoading, isError } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => fetchIdeaById(id),
  });

  // ✅ Fetch Top-Level Comments Only
  const { 
    data: commentsData, 
    isLoading: commentsLoading,
    isError: commentsError,
    error: commentsErrorDetail
  } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments({ idea_id: id }),
    enabled: !!id,
  });

  // 🕵️‍♂️ DEBUG LOGS FOR MAIN COMMENTS
  useEffect(() => {
    console.log(`📢 [Frontend] Asking Backend for comments on Idea ID: ${id}`);
    
    if (commentsData) {
      console.log("✅ [Backend] Response Received:", commentsData);
      console.log(`📊 Stats -> Total: ${commentsData.total}, Returned Array Length: ${commentsData.comments?.length}`);
      
      if (commentsData.total > 0 && commentsData.comments?.length === 0) {
        console.error("🚨 [CRITICAL ISSUE] Backend says Total > 0 but returned EMPTY Array! Check Pagination/Filtering logic.");
      }
    }

    if (commentsError) {
      console.error("❌ [Backend] API Failed:", commentsErrorDetail);
    }
  }, [commentsData, commentsError, id]);

  const { data: reactionData } = useQuery({
    queryKey: ["reactions", id],
    queryFn: () => getReactions(id),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const likeCount = reactionData?.likes ?? reactionData?.like_count ?? reactionData?.count ?? 0;
  
  const topLevelComments = commentsData?.comments || commentsData?.items || [];

  const commentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: (_, variables) => {
      toast.success("Comment posted!");
      setMainCommentBody("");
      console.log("📝 Comment Posted! Refreshing list...");
      
      if (variables.parent_id) {
        queryClient.invalidateQueries(["comments", "replies", variables.parent_id]);
      } else {
        queryClient.invalidateQueries(["comments", id]);
      }
    },
    onError: (err) => {
        console.error("❌ Post Comment Failed:", err);
        toast.error("Failed to post comment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries(["comments"]);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const voteMutation = useMutation({
    mutationFn: () => castVote({ target_id: id, value: 1 }),
    onSuccess: () => {
      toast.success("Voted!");
      queryClient.invalidateQueries(["reactions", id]);
    },
  });

  const handleDeleteIdea = async () => {
    if (window.confirm("Delete this idea?")) {
      try {
        await api.delete(`/ideas/${id}`);
        toast.success("Idea deleted");
        navigate("/ideas");
      } catch (e) { toast.error("Failed to delete"); }
    }
  };

  if (ideaLoading) return <div className="pt-24 text-center">Loading Idea...</div>;
  if (isError || !idea) return <div className="pt-24 text-center">Post Not Found</div>;

  return (
    <div className="pt-24 px-4 bg-gray-50 min-h-screen pb-10">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-4 text-gray-500 hover:text-black font-medium">&larr; Back</button>

        {/* Post Content */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{idea.current_version?.title}</h1>
            {user?.id === (idea.author_id || idea.author?.id) && (
              <div className="flex gap-2">
                <Link to={`/ideas/edit/${id}`} className="bg-gray-100 px-3 py-1 rounded text-sm">Edit</Link>
                <button onClick={handleDeleteIdea} className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm">Delete</button>
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
            <button onClick={() => voteMutation.mutate()} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition font-medium">
              <span>👍</span><span>{likeCount} Votes</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Comments ({topLevelComments.length})</h3>

          <div className="flex gap-3 mb-8">
            <input 
              value={mainCommentBody} 
              onChange={(e) => setMainCommentBody(e.target.value)} 
              placeholder="Start a discussion..." 
              className="flex-1 border rounded-lg px-4 py-2 outline-none" 
            />
            <button 
              onClick={() => commentMutation.mutate({ idea_id: id, body: mainCommentBody })} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Post
            </button>
          </div>

          <div className="space-y-6">
            {commentsLoading ? <div className="text-center">Loading...</div> : topLevelComments.length === 0 ? (
              <p className="text-center text-gray-500">No comments yet. (Check Console Logs if data missing)</p>
            ) : (
              topLevelComments.map((rootComment) => (
                <CommentItem 
                  key={rootComment.id || rootComment._id} 
                  comment={rootComment} 
                  user={user}
                  onDelete={(cid) => deleteCommentMutation.mutate(cid)}
                  submitReply={(parentId, text) => commentMutation.mutate({ idea_id: id, body: text, parent_id: parentId })}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
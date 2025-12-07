import axios from "axios";
import Cookies from "js-cookie";

const interactionApi = axios.create({
  baseURL: "https://final-project-p053.onrender.com/api/v1", 
});

interactionApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Endpoints ---

export const getComments = async ({ idea_id, parent_id, page = 1 }) => {
  const params = { 
    page, 
    limit: 50 // ✅ FIX: Change limit back to 50 (Backend logic seems to break at 10)
  };
  
  if (idea_id) params.idea_id = idea_id;
  if (parent_id) params.parent_id = parent_id;

  const res = await interactionApi.get(`/comments`, { params });
  return res.data; 
};

export const addComment = async ({ idea_id, body, parent_id }) => {
  const payload = { idea_id, body };
  if (parent_id) payload.parent_id = parent_id;
  
  const res = await interactionApi.post(`/comments`, payload);
  return res.data;
};

export const deleteComment = async (commentId) => {
  const res = await interactionApi.delete(`/admin/comments/${commentId}`);
  return res.data;
};

export const castVote = async ({ target_id, value = 1 }) => {
  const res = await interactionApi.post(`/votes`, {
    target_type: "idea",
    target_id,
    value 
  });
  return res.data;
};

export const getReactions = async (ideaId) => {
  const res = await interactionApi.get(`/reactions`, {
    params: { idea_id: ideaId }
  });
  return res.data; 
};

export default interactionApi;
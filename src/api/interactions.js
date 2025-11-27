import axios from "axios";
import Cookies from "js-cookie";

// ✅ FIX: 'withCredentials: true' ko hata diya hai
const interactionApi = axios.create({
  baseURL: "https://final-project-p053.onrender.com", 
  // withCredentials: true,  <-- YEH LINE DELETE KAR DI HAI
});

// Token Interceptor
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

// ... (Baaki saara code waisa hi rahe ga) ...

export const getComments = async (postId) => {
  const res = await interactionApi.get(`/comments/${postId}`);
  return res.data;
};

export const addComment = async ({ postId, text }) => {
  const res = await interactionApi.post(`/comments/${postId}`, { text });
  return res.data;
};

export const deleteComment = async (commentId) => {
  const res = await interactionApi.delete(`/comments/${commentId}`);
  return res.data;
};

export const toggleReaction = async (postId) => {
  const res = await interactionApi.post(`/reactions/${postId}`);
  return res.data;
};

export const getReactions = async (postId) => {
  const res = await interactionApi.get(`/reactions/${postId}`);
  return res.data;
};

export default interactionApi;
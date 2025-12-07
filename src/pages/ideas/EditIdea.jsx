import React from "react";
import IdeaForm from "../../components/IdeaForm";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Import navigate
import { useQuery } from "@tanstack/react-query";
import api from "../../api/auth";

const fetchIdeaById = async (id) => {
  const { data } = await api.get(`/ideas/${id}`);
  return data;
};

export default function EditIdea() {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ Hook

  const {
    data: idea,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => fetchIdeaById(id),
  });

  if (isLoading) return <div className="pt-24 text-center">Loading...</div>;
  if (isError) return <div className="pt-24 text-center text-red-600">Error loading idea.</div>;

  const formData = {
    id: idea.id,
    title: idea.current_version.title,
    summary: idea.current_version.short_summary,
    description: idea.current_version.body_md,
    tags: idea.tags,
    visibility: idea.visibility,
    stage: idea.stage,
    targetIndustry: idea.targetIndustry || "",
  };

  return (
    <div className="flex justify-center items-start pt-20 px-4 min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl">
        
        {/* ✅ Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-4 flex items-center text-gray-500 hover:text-gray-900 transition font-medium"
        >
          &larr; Cancel Editing
        </button>

        <IdeaForm initialData={formData} isEditing />
      </div>
    </div>
  );
}
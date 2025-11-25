import React from "react";
import IdeaForm from "../../components/IdeaForm";
import { useParams } from "react-router-dom"; // 1. useParams import karein
import { useQuery } from "@tanstack/react-query"; // 2. useQuery import karein
import api from "../../api/auth"; // 3. API instance import karein

// 4. Data fetch karnay ka function
const fetchIdeaById = async (id) => {
  const { data } = await api.get(`/ideas/${id}`);
  return data;
};

export default function EditIdea() {
  const { id } = useParams(); // URL se 'id' lein

  // 5. useQuery se idea fetch karein
  const {
    data: idea,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["idea", id], // Key ['idea', 'id']
    queryFn: () => fetchIdeaById(id),
  });

  // 6. Loading aur Error states
  if (isLoading) {
    return (
      <div className="pt-20 px-6 bg-gray-50 min-h-screen text-center">
        Loading idea for editing...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-20 px-6 bg-gray-50 min-h-screen text-center text-red-600">
        Error loading idea.
      </div>
    );
  }

  // 7. Data ko form ke format mein transform karein
  //    (Fetched data 'current_version' mein hai, form flat data expect karta hai)
  const formData = {
    id: idea.id, // ID ko pass karna zaroori hai
    title: idea.current_version.title,
    summary: idea.current_version.short_summary,
    description: idea.current_version.body_md,
    tags: idea.tags,
    visibility: idea.visibility,
    stage: idea.stage,
    targetIndustry: idea.targetIndustry || "", // Yeh field schema mein nahi tha, fallback
  };

  return (
    <div className="flex justify-center items-start pt-20 min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl">
        {/* 8. Transformed 'formData' ko 'initialData' mein pass karein */}
        <IdeaForm initialData={formData} isEditing />
      </div>
    </div>
  );
}
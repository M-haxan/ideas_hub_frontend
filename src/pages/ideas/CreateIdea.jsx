import React from "react";
import IdeaForm from "../../components/IdeaForm";
import { useNavigate } from "react-router-dom"; // ✅ Import

export default function CreateIdea() {
  const navigate = useNavigate(); // ✅ Hook

  return (
    <div className="flex justify-center items-start pt-20 px-4 min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl">
        
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition shadow-sm flex items-center gap-2 font-medium"
        >
          &larr; Cancel & Go Back
        </button>

        <IdeaForm />
      </div>
    </div>
  );
}
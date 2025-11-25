import React from "react";
import IdeaForm from "../../components/IdeaForm";

export default function CreateIdea() {
  return (
    <div className="flex justify-center items-start pt-20 min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl">
        <IdeaForm />
      </div>
    </div>
  );
}

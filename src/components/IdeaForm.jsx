import React, { useState, useEffect } from "react"; // 1. useEffect import karein
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/auth";

// Create function (pehlay se tha)
const createIdea = async (ideaData) => {
  const { data } = await api.post("/ideas", ideaData);
  return data;
};

// 2. Update function add karein
const updateIdea = async ({ id, ...ideaData }) => {
  const { data } = await api.put(`/ideas/${id}`, ideaData);
  return data;
};

export default function IdeaForm({ initialData = {}, isEditing = false }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: initialData.title || "",
    summary: initialData.summary || "",
    description: initialData.description || "",
    tags: initialData.tags || [],
    visibility: initialData.visibility || "public",
    stage: initialData.stage || "seed",
    targetIndustry: initialData.targetIndustry || "",
    attachments: [],
  });

  // 3. useEffect add karein taa ke 'initialData' load honay ke baad form update ho
  useEffect(() => {
    if (isEditing && initialData.id) {
      setForm({
        ...form, // Purani attachments (agar hon) ko rakhein
        title: initialData.title || "",
        summary: initialData.summary || "",
        description: initialData.description || "",
        tags: initialData.tags || [],
        visibility: initialData.visibility || "public",
        stage: initialData.stage || "seed",
        targetIndustry: initialData.targetIndustry || "",
      });
    }
  }, [initialData, isEditing]); // Jab yeh props change hon, state update ho

  // Create mutation (pehlay se tha)
  const createMutation = useMutation({
    mutationFn: createIdea,
    onSuccess: () => {
      toast.success("Idea created successfully!");
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      navigate("/IdeaList");
    },
    onError: (error) => {
      const err = error.response?.data?.detail || "Failed to create idea";
      toast.error(err);
    },
  });

  // 4. Update mutation add karein
  const updateMutation = useMutation({
    mutationFn: updateIdea,
    onSuccess: (data) => {
      toast.success("Idea updated successfully!");
      // Dono caches ko invalidate karein
      queryClient.invalidateQueries({ queryKey: ["ideas"] }); // List page
      queryClient.invalidateQueries({ queryKey: ["idea", data.id] }); // Detail page
      navigate(`/IdeaDetail/${data.id}`); // User ko detail page par bhej dein
    },
    onError: (error) => {
      const err = error.response?.data?.detail || "Failed to update idea";
      toast.error(err);
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTagChange = (e) => {
    setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()) });
  };

  const onDrop = (acceptedFiles) => {
    setForm({ ...form, attachments: acceptedFiles });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // 5. handleSubmit ko update karein
  const handleSubmit = (e) => {
    e.preventDefault();

    // Data ko API Schema ke mutabiq transform karein
    // (Yeh schema 'Create' aur 'Put' dono ke liye same hai)
    const apiData = {
      title: form.title,
      short_summary: form.summary,
      body_md: form.description,
      tags: form.tags,
      visibility: form.visibility,
      stage: form.stage,
      // attachments abhi bhi mock/empty hain
    };

    if (isEditing) {
      // 6. Update mutation ko call karein
      updateMutation.mutate({ id: initialData.id, ...apiData });
    } else {
      createMutation.mutate(apiData);
    }
  };

  // Is loading state ko update karein
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold">
        {isEditing ? "Edit Idea" : "Create New Idea"}
      </h2>

      {/* ... (Baaki form inputs waisay hi) ... */}
      {/* Title */}
      <input
        name="title"
        placeholder="Idea Title"
        value={form.title}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />

      {/* Summary (short_summary) */}
      <input
        name="summary"
        placeholder="Short Summary"
        value={form.summary}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />

      {/* Description (body_md) */}
      <textarea
        name="description"
        placeholder="Full Description (Markdown supported)"
        rows={6}
        value={form.description}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2"
      />

      {/* Tags */}
      <input
        name="tags"
        placeholder="Tags (comma separated)"
        value={form.tags.join(",")}
        onChange={handleTagChange}
        className="w-full border rounded-lg px-3 py-2"
      />

      {/* Visibility */}
      <div>
        <label className="block mb-1 font-medium">Visibility</label>
        <select
          name="visibility"
          value={form.visibility}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Stage */}
      <div>
        <label className="block mb-1 font-medium">Stage</label>
        <select
          name="stage"
          value={form.stage}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="seed">Seed</option>
          <option value="prototype">Prototype</option>
          <option value="growth">Growth</option>
        </select>
      </div>

      {/* Target Industry */}
      <input
        name="targetIndustry"
        placeholder="Target Industry"
        value={form.targetIndustry}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2"
      />

      {/* Attachments */}
      <div {...getRootProps()} className="border-2 border-dashed p-4 rounded-lg text-center cursor-pointer">
        <input {...getInputProps()} />
        <p className="text-gray-500">Drag & drop attachments or click to upload</p>
      </div>

      {form.attachments.length > 0 && (
        <ul className="text-sm text-gray-700">
          {form.attachments.map((file) => (
            <li key={file.name}>{file.name}</li>
          ))}
        </ul>
      )}
      
      {/* 7. Button ko update karein */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70"
      >
        {isEditing
          ? isLoading
            ? "Updating..."
            : "Update Idea"
          : isLoading
          ? "Creating..."
          : "Create Idea"}
      </button>
    </form>
  );
}
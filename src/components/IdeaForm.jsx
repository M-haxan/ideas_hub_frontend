import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api, { uploadImages } from "../api/auth"; // ✅ uploadImages import kiya

const createIdea = async (ideaData) => {
  const { data } = await api.post("/ideas", ideaData);
  return data;
};

const updateIdea = async ({ id, ...ideaData }) => {
  const { data } = await api.put(`/ideas/${id}`, ideaData);
  return data;
};

export default function IdeaForm({ initialData = {}, isEditing = false }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false); // ✅ Uploading state

  const [form, setForm] = useState({
    title: initialData.title || "",
    summary: initialData.summary || "",
    description: initialData.description || "",
    tags: initialData.tags || [],
    visibility: initialData.visibility || "public",
    stage: initialData.stage || "seed",
    targetIndustry: initialData.targetIndustry || "",
    attachments: [], // Yeh ab mixed ho sakta hai (Files objects OR URL strings)
  });

  useEffect(() => {
    if (isEditing && initialData.id) {
      setForm({
        ...form,
        title: initialData.title || "",
        summary: initialData.summary || "",
        description: initialData.description || "",
        tags: initialData.tags || [],
        visibility: initialData.visibility || "public",
        stage: initialData.stage || "seed",
        targetIndustry: initialData.targetIndustry || "",
        attachments: initialData.attachments || [], // Purane URLs
      });
    }
  }, [initialData, isEditing]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createIdea,
    onSuccess: () => {
      toast.success("Idea created successfully!");
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      navigate("/ideas");
    },
    onError: (error) => toast.error(error.response?.data?.detail || "Failed to create idea"),
  });

  const updateMutation = useMutation({
    mutationFn: updateIdea,
    onSuccess: (data) => {
      toast.success("Idea updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      queryClient.invalidateQueries({ queryKey: ["idea", data.id] });
      navigate(`/ideas/${data.id}`);
    },
    onError: (error) => toast.error(error.response?.data?.detail || "Failed to update idea"),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTagChange = (e) => {
    setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()) });
  };

  // ✅ Files handling update
  const onDrop = (acceptedFiles) => {
    // Purane attachments (URLs) aur naye files ko mila kar rakhein
    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...acceptedFiles],
    }));
  };

  // Remove attachment helper
  const removeAttachment = (index) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // ✅ MAIN SUBMIT LOGIC WITH DEBUGGING
  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalUrls = [];
    const filesToUpload = [];
    const existingUrls = [];

    // 1. Files aur URLs ko alag karein
    form.attachments.forEach((item) => {
      if (item instanceof File) {
        filesToUpload.push(item);
      } else if (typeof item === "string") {
        existingUrls.push(item);
      }
    });

    try {
      // 2. Upload new files if any
      if (filesToUpload.length > 0) {
        setIsUploading(true);
        const toastId = toast.loading("Uploading images...");
        
        const response = await uploadImages(filesToUpload); // API call
        
        // 🕵️‍♂️ DEBUG LOG 2: Dekhein function ko kya mila
        console.log("📦 Upload Function Output:", response);

        toast.dismiss(toastId);
        setIsUploading(false);
        
        // Backend se naye URLs mil gaye
        // NOTE: Yahan check karein ke backend 'uploaded_urls' bhej raha hai ya kuch aur
        if (response && response.uploaded_urls) {
          finalUrls = [...existingUrls, ...response.uploaded_urls];
        } else if (Array.isArray(response)) {
           // Agar backend direct array bhej raha hai
           finalUrls = [...existingUrls, ...response];
        } else {
          console.warn("⚠️ No URLs found in response:", response);
          finalUrls = existingUrls;
        }
      } else {
        finalUrls = existingUrls;
      }

      // 🕵️‍♂️ DEBUG LOG 3: Final URLs jo SQL mein jayen gay
      console.log("🔗 Final URLs for DB:", finalUrls);

      // 3. Prepare final data
      const apiData = {
        title: form.title,
        short_summary: form.summary,
        body_md: form.description,
        tags: form.tags,
        visibility: form.visibility,
        stage: form.stage,
        attachments: finalUrls, // ✅ Sirf URLs bhej rahe hain
      };

      // 🕵️‍♂️ DEBUG LOG 4: Poora Payload check karein
      console.log("🚀 Sending Data to Create Idea:", apiData);

      // 4. Submit Idea
      if (isEditing) {
        updateMutation.mutate({ id: initialData.id, ...apiData });
      } else {
        createMutation.mutate(apiData);
      }

    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      toast.error("Image upload failed. Please try again.");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800">
        {isEditing ? "Edit Idea" : "Create New Idea"}
      </h2>

      {/* Title */}
      <input
        name="title"
        placeholder="Idea Title"
        value={form.title}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      {/* Summary */}
      <input
        name="summary"
        placeholder="Short Summary"
        value={form.summary}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      {/* Description */}
      <textarea
        name="description"
        placeholder="Full Description (Markdown supported)"
        rows={6}
        value={form.description}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Tags */}
      <input
        name="tags"
        placeholder="Tags (comma separated)"
        value={Array.isArray(form.tags) ? form.tags.join(",") : form.tags}
        onChange={handleTagChange}
        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Visibility */}
        <div>
          <label className="block mb-1 font-medium text-gray-700 text-sm">Visibility</label>
          <select
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-white"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="block mb-1 font-medium text-gray-700 text-sm">Stage</label>
          <select
            name="stage"
            value={form.stage}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-white"
          >
            <option value="seed">Seed</option>
            <option value="prototype">Prototype</option>
            <option value="growth">Growth</option>
          </select>
        </div>
      </div>

      {/* Target Industry */}
      <input
        name="targetIndustry"
        placeholder="Target Industry"
        value={form.targetIndustry}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Attachments Dropzone */}
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition">
        <input {...getInputProps()} />
        <p className="text-gray-500">Drag & drop images here, or click to select</p>
      </div>

      {/* Attachments Preview List */}
      {form.attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-gray-700">Attachments:</p>
          <ul className="grid grid-cols-2 gap-2">
            {form.attachments.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border text-sm">
                <span className="truncate max-w-[200px]">
                  {file instanceof File ? file.name : `Image ${index + 1} (Uploaded)`}
                </span>
                <button 
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700 font-bold ml-2"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-70 transition font-medium"
      >
        {isEditing
          ? isLoading ? "Updating..." : "Update Idea"
          : isLoading ? "Creating & Uploading..." : "Create Idea"}
      </button>
    </form>
  );
}
import React, { useState } from "react";
import { getComments } from "../api/interactions"; // Wahi API function use karein jo app mein hai

export default function TestComments() {
  const [ideaId, setIdeaId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!ideaId) return alert("Idea ID daalein!");
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log("Fetching comments for:", ideaId);
      // Direct API function call
      const response = await getComments(ideaId);
      console.log("API Response:", response);
      setData(response);
    } catch (err) {
      console.error("Test Error:", err);
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto pt-24">
      <h1 className="text-2xl font-bold mb-4">🔍 API Debugger</h1>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Paste Idea UUID here..."
          value={ideaId}
          onChange={(e) => setIdeaId(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button 
          onClick={handleCheck}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      {/* ERROR SECTION */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* RESULT SECTION */}
      {data && (
        <div className="bg-gray-100 p-4 rounded border border-gray-300 overflow-auto max-h-[500px]">
          <h3 className="font-bold text-gray-700 mb-2">Backend Response (Raw JSON):</h3>
          <pre className="text-xs text-green-700 font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
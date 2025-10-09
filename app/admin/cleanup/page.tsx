"use client";

import { useState } from "react";

export default function CleanupPage() {
  const [result, setResult] = useState<null | {
    count: number;
    deleted: string[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCleanup = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/cleanup", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to clean up.");
      }

      setResult({ count: data.count, deleted: data.deleted });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        🧹 Cleanup Orphaned Images
      </h1>
      <button
        onClick={handleCleanup}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        disabled={loading}
      >
        {loading ? "Cleaning..." : "Run Cleanup"}
      </button>

      {error && <p className="text-red-500 mt-4">❌ {error}</p>}

      {result && (
        <div className="mt-6">
          <p className="text-green-700">
            ✅ Deleted {result.count} orphaned image(s).
          </p>
          {result.deleted.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
              {result.deleted.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

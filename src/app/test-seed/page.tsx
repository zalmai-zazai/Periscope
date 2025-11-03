"use client";

import { useState } from "react";

export default function TestSeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch(
        "/api/areas/[areaId]/line-items/seed-catalog",
        {
          method: "POST",
        }
      );

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult("Error: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Test Seed Catalog</h1>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? "Seeding..." : "Seed Catalog"}
        </button>
        {result && (
          <pre className="bg-gray-100 p-4 rounded text-sm">{result}</pre>
        )}
      </div>
    </div>
  );
}

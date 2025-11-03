"use client";

import { useState } from "react";

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testEmailConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-email");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to test email" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Email Configuration Test</h1>

        <button
          onClick={testEmailConfig}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Email Configuration"}
        </button>

        {result && (
          <div
            className={`mt-4 p-4 rounded ${
              result.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>Note:</strong> This tests if your email server is connected.
          </p>
          <p>
            If using Ethereal.email, check https://ethereal.email/ for test
            emails.
          </p>
        </div>
      </div>
    </div>
  );
}

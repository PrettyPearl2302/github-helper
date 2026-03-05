"use client";

import { useState } from "react";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function analyzeRepo() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoUrl }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen p-10 bg-white text-black">
      <div className="max-w-2xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">
          CodeLens
        </h1>

        <p className="text-gray-600">
          Understand any GitHub repository in seconds.
        </p>

        <div className="flex gap-2">
          <input
            className="border p-3 w-full rounded"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <button
            onClick={analyzeRepo}
            disabled={loading}
            className="bg-black text-white px-4 rounded flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <span className="text-gray-400">Try:</span>

        <button
          type="button"
          onClick={() => setRepoUrl("https://github.com/vercel/next.js")}
          className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
        >
          vercel/next.js
        </button>

        <button
          type="button"
          onClick={() => setRepoUrl("https://github.com/supabase/supabase")}
          className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
        >
          supabase/supabase
        </button>

        <button
          type="button"
          onClick={() => setRepoUrl("https://github.com/openai/openai-python")}
          className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
        >
          openai/openai-python
        </button>
      </div>

        {loading && (
          <div className="border p-5 rounded text-gray-600 flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Reading repository structure...
          </div>
        )}

        {result?.error && (
          <div className="border border-red-200 bg-red-50 p-4 rounded text-red-800">
            <strong>Error:</strong> {result.error}
          </div>
        )}

        {result && !result.error && (
          <div className="border p-5 rounded space-y-3">
            <h2 className="text-xl font-semibold">Summary</h2>
            <p>{result.summary}</p>

            <h2 className="text-xl font-semibold">Tech Stack</h2>
            <ul className="list-disc pl-5">
              {result.techStack?.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold">Architecture</h2>
            <ul className="list-disc pl-5">
              {result.architecture?.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold">How to Run</h2>
            <ul className="list-disc pl-5">
              {result.onboarding?.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </main>
  );
}
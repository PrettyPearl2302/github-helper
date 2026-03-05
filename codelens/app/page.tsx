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

  const tryRepos = [
    { label: "vercel/next.js", url: "https://github.com/vercel/next.js", color: "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200" },
    { label: "supabase/supabase", url: "https://github.com/supabase/supabase", color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200" },
    { label: "openai/openai-python", url: "https://github.com/openai/openai-python", color: "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200" },
  ];

  return (
    <main className="main-gradient min-h-screen p-6 sm:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-teal-600">
            CodeLens
          </h1>
          <p className="mt-2 text-slate-600 text-lg">
            Understand unfamiliar GitHub repositories instantly. AI analyzes
            structure, stack, and onboarding steps.
          </p>
        </header>

        {/* Input card */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/50 p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <button
              onClick={analyzeRepo}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shrink-0 shadow-sm hover:shadow transition"
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

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Try:</span>
            {tryRepos.map(({ label, url, color }) => (
              <button
                key={url}
                type="button"
                onClick={() => setRepoUrl(url)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${color}`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-3 text-slate-600">
            <svg
              className="animate-spin h-5 w-5 shrink-0 text-teal-600"
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
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-red-800 shadow-sm">
            <strong>Error:</strong> {result.error}
          </div>
        )}

        {result && !result.error && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Analysis</h2>
              <p className="text-teal-100 text-sm mt-0.5">Summary, stack, and how to run</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">Summary</h3>
                <p className="text-slate-700 leading-relaxed">{result.summary}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">Tech Stack</h3>
                <ul className="flex flex-wrap gap-2">
                  {result.techStack?.map((t: string, i: number) => (
                    <li
                      key={i}
                      className="rounded-lg bg-teal-50 text-teal-800 px-3 py-1.5 text-sm font-medium"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">Architecture</h3>
                <ul className="space-y-1.5">
                  {result.architecture?.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">How to Run</h3>
                <ul className="space-y-1.5">
                  {result.onboarding?.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="text-teal-500 mt-0.5">→</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(input.trim());
    if (url.hostname !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

async function ghJson(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "CodeLens",
    },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    // GitHub often returns useful JSON error messages; keep raw text for debugging
    throw new Error(`GitHub ${res.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`GitHub returned non-JSON: ${text.slice(0, 300)}`);
  }
}

function safeJsonParse(maybeJson: string) {
  try {
    return JSON.parse(maybeJson);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { repoUrl } = await req.json();

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub repo URL" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY. Add it to .env.local and restart `npm run dev`." },
        { status: 500 }
      );
    }

    const { owner, repo } = parsed;

    const repoMeta = await ghJson(`https://api.github.com/repos/${owner}/${repo}`);
    const contents = await ghJson(`https://api.github.com/repos/${owner}/${repo}/contents`);

    const fileList = Array.isArray(contents)
      ? contents.map((f: any) => f?.name).filter(Boolean).slice(0, 40)
      : [];

    const prompt = `
You are a senior software engineer onboarding to a new repository.

Analyze this repository and explain it simply, based ONLY on the info provided.

Repository: ${repoMeta.full_name}
Description: ${repoMeta.description ?? "N/A"}
Primary language: ${repoMeta.language ?? "Unknown"}
Top-level files: ${fileList.join(", ")}

Return valid JSON exactly matching:
{
  "summary": string,
  "techStack": string[],
  "architecture": string[],
  "onboarding": string[]
}
Keep each list to 4-8 bullets max. Be honest about uncertainty.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" }, // THIS LINE FIXES IT
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const parsedJson = safeJsonParse(content);

    if (!parsedJson) {
      // Don’t crash. Return something useful + the raw model output for debugging.
      return NextResponse.json(
        {
          error: "Model did not return valid JSON.",
          raw: content,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedJson);
  } catch (err: any) {
    // This is the key: you’ll see the real reason in terminal now.
    console.error("ANALYZE_ROUTE_ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
# FORGE — Software Engineering Intelligence Platform

Forge is a browser-first engineering intelligence tool for public GitHub repositories. It transforms a repository into deterministic code facts, an interactive relationship graph, impact analysis, and an optional AI engineering review.

## Architecture

```text
GitHub public API
      ↓ (filtered text blobs only)
Browser ingestion → Web Worker static analysis → file/symbol/import graph
      ↓                                      ↓
bounded structural digest                  interactive report / impact simulator
      ↓
Vercel /api/analyze → Groq API → validated AI interpretation
```

## How it works

1. The client validates a GitHub URL and makes two GitHub REST calls only: repository metadata and its file tree.
2. Supported source files are retrieved from GitHub’s raw-content CDN, not the rate-limited REST API. Generated folders, dependency folders, locks, binaries, unsupported extensions, and files over 350 KB are excluded; a maximum of 420 useful text files is selected.
3. A Web Worker extracts imports, exports, symbols, language counts, approximate complexity, entry points, and selected security/configuration signals. It resolves local JavaScript/TypeScript import relationships into a graph.
4. The graph, file explorer, health heuristics, and Impact Simulator use those deterministic facts locally.
5. If configured, only a size-limited structural digest (not the full repository source) is posted to `/api/analyze` for an AI interpretation. The response is validated before rendering.

## Security and privacy

- Repository source is processed in the browser and is not persisted by Forge.
- `GROQ_API_KEY` is read only in the Vercel serverless function. It is never included in client code or returned in a response.
- Do not put secrets in frontend environment variables. `.env`, `.env.local`, and `.env.*.local` are ignored.
- The security panel is a lightweight static signal, **not** a substitute for a security audit.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `GROQ_API_KEY` only if you want the optional AI review. To exercise Vercel API routes locally, use `vercel dev`; the static interface works with Vite alone.

## Vercel deployment

Import this repository into Vercel, set `GROQ_API_KEY` in Project Settings → Environment Variables, and deploy. Vercel serves the static frontend and invokes `/api/analyze` only for the secure AI provider call—there is no continuous backend or Render service.

## Limitations and future work

Import parsing currently favors JavaScript/TypeScript patterns; the worker is intentionally isolated so AST adapters for Python, Go, Rust, Java, and other languages can be added without changing the UI. The relationship graph represents resolvable imports, not proof of runtime call behavior. Large repositories are intentionally sampled to preserve browser responsiveness and GitHub API budgets.

export default function Home() {
  const stacks = [
    "Next.js frontend",
    "TypeScript monolithic backend",
    "PostgreSQL + Redis",
    "Bun runtime",
    "Docker deployment",
  ];

  const commands = [
    "bun install --cwd frontend",
    "bun install --cwd backend",
    "bun run dev:frontend",
    "bun run dev:backend",
    "docker compose up --build",
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 md:px-10 lg:py-16">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-strong)] p-8 shadow-[0_24px_80px_rgba(60,44,24,0.12)] backdrop-blur md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
            TEFast Starter
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Full-stack scaffold with Next.js, Bun, PostgreSQL, Redis, and Docker.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            The project is split into a dedicated frontend and a monolithic backend,
            ready for local development and containerized deployment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {stacks.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[#1d1d1b] p-8 text-[#f8f1e5] shadow-[0_18px_60px_rgba(30,22,12,0.16)]">
          <p className="text-sm uppercase tracking-[0.28em] text-[#f0a27a]">
            Service Ports
          </p>
          <div className="mt-6 space-y-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-[#f0a27a]">frontend</p>
              <p className="mt-2 text-base">http://localhost:3000</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-[#f0a27a]">backend</p>
              <p className="mt-2 text-base">http://localhost:3001</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-[#f0a27a]">health</p>
              <p className="mt-2 text-base">GET /health</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
            Monolithic Backend
          </p>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            The backend is scaffolded around `src/config`, `src/modules`, and
            `src/shared`, making it easy to keep shared infrastructure separate
            from business modules as the codebase grows.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-strong)] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
            Quick Start
          </p>
          <div className="mt-5 grid gap-3">
            {commands.map((command) => (
              <code
                key={command}
                className="rounded-2xl border border-[var(--border)] bg-[#221d19] px-4 py-3 text-sm text-[#f8f1e5]"
              >
                {command}
              </code>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

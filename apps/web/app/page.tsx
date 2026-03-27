import { interviewDifficultyValues, interviewModeValues } from "@prepforge/types";
import { Card } from "@prepforge/ui";

import { AccessPanel } from "./_components/access-panel";

const foundationTracks = [
  "Monorepo and package boundaries",
  "Better Auth and session boundaries",
  "Workspace-aware tenancy",
  "Dedicated AI package",
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="rounded-[var(--pf-radius-lg)] border-white/15 bg-slate-950/40 p-8">
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-cyan-200/80">
              PrepForge Foundation
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Build the platform first so features stay cheap to add later.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              This repo starts with strict boundaries: apps consume packages, packages
              provide contracts, AI stays isolated behind one package surface, and
              tenancy is resolved from authenticated session context rather than request
              body input.
            </p>
          </Card>

          <AccessPanel />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {foundationTracks.map((track) => (
            <Card key={track}>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Foundation Track
              </p>
              <h2 className="mt-3 text-xl font-medium text-white">{track}</h2>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Supported Session Modes
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {interviewModeValues.map((mode) => (
                <span
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100"
                  key={mode}
                >
                  {mode}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Difficulty Ladder
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {interviewDifficultyValues.map((difficulty) => (
                <span
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100"
                  key={difficulty}
                >
                  {difficulty}
                </span>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

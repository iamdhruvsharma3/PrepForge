import type { CSSProperties } from "react";

import { webThemeVariables } from "@prepforge/tokens";

import { adminEnv } from "./env";

const cards = [
  "Tenant-aware analytics",
  "Question bank management",
  "Feature flags and rollout control",
  "Usage visibility by workspace",
];

export default function App() {
  return (
    <main className="admin-shell" style={webThemeVariables as CSSProperties}>
      <section className="panel">
        <p className="eyebrow">PrepForge Admin</p>
        <h1 className="headline">Operational tools stay separate from product UI.</h1>
        <p className="muted">
          The admin app is its own surface, but it still consumes shared contracts and
          tokens from the workspace. API target: {adminEnv.VITE_API_BASE_URL}
        </p>
      </section>

      <section className="admin-grid" style={{ marginTop: 20 }}>
        {cards.map((card) => (
          <article className="panel" key={card}>
            <p className="eyebrow">Module</p>
            <h2 style={{ margin: 0 }}>{card}</h2>
          </article>
        ))}
      </section>
    </main>
  );
}


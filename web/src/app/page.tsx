import GameLinks from "../components/GameLinks";
import ParticlesCanvas from "../components/ParticlesCanvas";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <header>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>msartintarm · games</h1>
        <p style={{ opacity: 0.7, fontSize: 13, margin: "6px 0 0" }}>
          A few browser games, plus the landing page itself: a bare-bones Rust/WASM
          particle sim running on the CPU — flip the compute backend to CPU threads to
          watch it parallelize. No GPU path (yet).
        </p>
      </header>

      <ParticlesCanvas />

      <GameLinks />
    </main>
  );
}

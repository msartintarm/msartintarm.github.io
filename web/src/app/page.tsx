import GameLinks from "../components/GameLinks";
import ParticlesCanvas from "../components/ParticlesCanvas";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        zIndex: 0,
      }}
    >
      {/* Full-viewport particle backdrop (fixed, behind everything). */}
      <ParticlesCanvas />

      {/* Foreground content — sits above the backdrop; the game list frosts it. */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <header>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>msartintarm · games</h1>
        </header>

        <GameLinks />
      </div>
    </main>
  );
}

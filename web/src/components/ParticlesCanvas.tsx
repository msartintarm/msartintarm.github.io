"use client";

import { useEffect, useRef, useState } from "react";
import { basePath } from "../lib/basePath";
import styles from "./ParticlesCanvas.module.css";

// The subset of the wasm `Simulation` API this demo drives (see engine/src/bridge.rs).
type Sim = {
  set_viewport(w: number, h: number): void;
  set_count(n: number): void;
  count(): number;
  advance(dt: number): void;
  instances(): Float32Array; // flat [x, y, hue] per particle
  set_accel_backend(name: string): void;
  accel_backend(): string;
  set_threads_ready(ready: boolean): void;
  set_par_threshold(n: number): void;
  par_threshold(): number;
  is_parallel(): boolean;
};

// The wasm-bindgen module namespace from the generated `engine.js`. The threaded
// build additionally exports `initThreadPool` (the rayon worker pool).
type EngineModule = {
  default: (input?: unknown) => Promise<unknown>;
  Simulation: { new (seed: number): Sim };
};
type ThreadedEngineModule = EngineModule & { initThreadPool(numThreads: number): Promise<void> };

const MIN_COUNT = 100;
const MAX_COUNT = 6000;

export default function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const statsRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  const [error, setError] = useState<string | null>(null);
  const [compute, setCompute] = useState("serial");
  const [count, setCount] = useState(1500);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let disposed = false;
    const canvas = canvasRef.current!;

    (async () => {
      try {
        // The compute backend decides *which* wasm module loads — the CPU-threads
        // build (rayon + SharedArrayBuffer) is a separate artifact from the single-
        // threaded one, so it can't be switched at runtime. The dropdown reloads with
        // `?compute=<serial|threads>`; we honour it here.
        const requested = new URLSearchParams(window.location.search).get("compute") ?? "serial";
        setCompute(requested);
        const wantThreads = requested === "threads";
        // Threads need cross-origin isolation (COOP/COEP via the shim SW, which reloads
        // once) — only bother when threads are actually requested.
        if (wantThreads) await ensureCrossOriginIsolation();
        if (disposed) return;
        const isolated = typeof window !== "undefined" && window.crossOriginIsolated;
        let mod: EngineModule | null = null;
        let threadsReady = false;
        if (wantThreads && isolated) {
          try {
            const t = (await import(/* webpackIgnore: true */ `${basePath()}/wasm-pkg-threads/engine.js`)) as ThreadedEngineModule;
            await t.default();
            // Bound the pool init so a build whose workers can't boot degrades instead of hanging.
            await Promise.race([
              t.initThreadPool(navigator.hardwareConcurrency || 4),
              new Promise((_, reject) => setTimeout(() => reject(new Error("initThreadPool timed out")), 10000)),
            ]);
            mod = t;
            threadsReady = true;
          } catch (e) {
            console.warn("CPU-threads build unavailable; using single-threaded:", e);
          }
        }
        if (!mod) {
          mod = (await import(/* webpackIgnore: true */ `${basePath()}/wasm-pkg/engine.js`)) as EngineModule;
          await mod.default();
        }
        if (disposed) return;

        const sim = new mod.Simulation(0xc0ffee);
        simRef.current = sim;
        if (threadsReady) sim.set_threads_ready(true); // CPU-threads pool usable
        sim.set_accel_backend(requested); // honour ?compute= (falls back to serial if unavailable)
        setReady(true);

        // Size the backing store to the displayed CSS size × devicePixelRatio, so the
        // canvas stays crisp on HiDPI and under browser zoom. The sim's world units are
        // the backing-store pixels.
        const resizeCanvas = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
          const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
          if (canvas.width === w && canvas.height === h) return;
          canvas.width = w;
          canvas.height = h;
          sim.set_viewport(w, h);
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const ctx = canvas.getContext("2d")!;
        const draw = (now: number) => {
          const dt = Math.min((now - last) / 1000, 0.1);
          last = now;
          if (playingRef.current) sim.advance(dt);

          ctx.fillStyle = "#0b0e13";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const inst = sim.instances();
          const r = Math.max(1.2, canvas.width / 700);
          for (let i = 0; i < inst.length; i += 3) {
            const hue = inst[i + 2]; // 0 = slow → blue, 1 = fast → red
            const rc = Math.round(90 + hue * 165);
            const gc = Math.round(140 - hue * 60);
            const bc = Math.round(230 - hue * 150);
            ctx.fillStyle = `rgb(${rc},${gc},${bc})`;
            ctx.beginPath();
            ctx.arc(inst[i], inst[i + 1], r, 0, Math.PI * 2);
            ctx.fill();
          }

          if (statsRef.current) {
            const n = sim.count();
            const backend = sim.accel_backend();
            let exec = backend;
            if (backend === "threads") {
              const thr = sim.par_threshold();
              exec = sim.is_parallel() ? `threads ▸ parallel (≥${thr})` : `threads ▸ serial (<${thr})`;
            }
            statsRef.current.textContent = `${n} particles · ${exec}`;
          }
          raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
      } catch (e) {
        setError(String(e));
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  // Keep the sim's particle count in step with the slider without restarting the loop.
  useEffect(() => {
    simRef.current?.set_count(count);
  }, [count]);

  const toggle = () => {
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
  };

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.controls}>
        <button className={styles.button} onClick={toggle} disabled={!ready}>
          {playing ? "Pause" : "Play"}
        </button>

        <label className={styles.field}>
          Particles {count}
          <input
            type="range"
            min={MIN_COUNT}
            max={MAX_COUNT}
            step={100}
            value={count}
            disabled={!ready}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </label>

        <select
          className={styles.button}
          value={compute}
          disabled={!ready}
          title="Executor for the per-particle force pass. Switching reloads the page (the CPU-threads build is a separate wasm module). If threads are unavailable it falls back to serial — see the status line."
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set("compute", e.target.value);
            window.location.href = url.toString();
          }}
        >
          <option value="serial">Compute: serial (1 core)</option>
          <option value="threads">Compute: CPU threads</option>
        </select>

        <span className={styles.status}>
          {!ready && !error && "loading engine…"}
          {error && <span style={{ color: "#ff7b72" }}>engine failed: {error}</span>}
          {ready && <span ref={statsRef} />}
        </span>
      </div>
    </div>
  );
}

/** Register the COOP/COEP shim service worker so the page becomes cross-origin
 * isolated (enabling SharedArrayBuffer, and thus the wasm CPU-thread pool). On the
 * first visit the worker isn't controlling yet, so reload once (guarded against a
 * loop); on a browser without service workers, or if it fails, we silently stay
 * single-threaded. */
async function ensureCrossOriginIsolation(): Promise<void> {
  if (typeof window === "undefined" || window.crossOriginIsolated) return;
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register(`${basePath()}/coi-serviceworker.js`);
    if (reg.active && !navigator.serviceWorker.controller && !sessionStorage.getItem("coiReloaded")) {
      sessionStorage.setItem("coiReloaded", "1");
      window.location.reload();
    }
  } catch (e) {
    console.warn("COOP/COEP shim registration failed:", e);
  }
}

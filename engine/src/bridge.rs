//! Browser bridge: wraps the pure [`crate::sim::World`] in a `#[wasm_bindgen]`
//! `Simulation` the canvas frontend drives. Compiled only for `wasm32`.
//!
//! Backend selection matches `../traffic`: the CPU-threads build is a *separate*
//! wasm module (nightly + atomics + `wasm-bindgen-rayon`), so the frontend picks the
//! module at load time via `?compute=`. Within a threaded module the step still runs
//! serially below `par_threshold` particles (rayon overhead isn't worth it) and in
//! parallel at/above it — `is_parallel()` reports which happened this frame.

use crate::sim::World;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Simulation {
    world: World,
    backend: String,   // requested backend: "serial" | "threads"
    threads_ready: bool, // the rayon pool actually booted (threaded module only)
    par_threshold: usize,
    last_parallel: bool, // did the most recent advance() run the parallel force pass
    buf: Vec<f32>,       // reused [x, y, hue] scratch for instances()
}

#[wasm_bindgen]
impl Simulation {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: u32) -> Simulation {
        Simulation {
            world: World::new(seed as u64, 1500, 900.0, 600.0),
            backend: "serial".to_string(),
            threads_ready: false,
            par_threshold: 800,
            last_parallel: false,
            buf: Vec::new(),
        }
    }

    pub fn set_viewport(&mut self, w: f32, h: f32) {
        self.world.set_viewport(w, h);
    }

    pub fn set_count(&mut self, n: usize) {
        self.world.set_count(n);
    }

    pub fn count(&self) -> usize {
        self.world.count()
    }

    /// Advance one frame. Runs the parallel force pass only when the threads backend
    /// is requested, its pool booted, and the particle count clears the threshold.
    pub fn advance(&mut self, dt: f32) {
        let parallel = self.backend == "threads"
            && self.threads_ready
            && self.world.count() >= self.par_threshold;
        self.last_parallel = parallel;
        self.world.step(dt, parallel);
    }

    /// Flat `[x, y, hue]` per particle for the 2D canvas renderer.
    pub fn instances(&mut self) -> Vec<f32> {
        self.world.write_instances(&mut self.buf);
        self.buf.clone()
    }

    // ---- backend controls (mirror traffic's status-line semantics) ----

    pub fn set_accel_backend(&mut self, name: &str) {
        self.backend = name.to_string();
    }

    pub fn accel_backend(&self) -> String {
        self.backend.clone()
    }

    pub fn set_threads_ready(&mut self, ready: bool) {
        self.threads_ready = ready;
    }

    pub fn set_par_threshold(&mut self, n: usize) {
        self.par_threshold = n;
    }

    pub fn par_threshold(&self) -> usize {
        self.par_threshold
    }

    /// Whether the most recent `advance()` used the parallel force pass.
    pub fn is_parallel(&self) -> bool {
        self.last_parallel
    }
}

//! Bare-bones N-body-ish particle world — the compute core of the landing-page
//! demo. Pure, dependency-light, and native-`cargo test`-able: no DOM, no wasm, no
//! GPU. Its one job is a per-particle force pass whose cost scales with the particle
//! count, so the CPU-serial and CPU-threads backends have something to race on.
//!
//! Architecture mirrors the sibling `../traffic` engine: the simulation is a pure
//! core here, and the browser bridge (`crate::bridge`) is added behind a
//! `cfg(target_arch = "wasm32")` gate so this stays fast to test off-target.
//!
//! Determinism note: the force pass parallelizes over particle *i* only; each
//! `acc[i]` sums over `j` in the same `0..n` order whether run serially or with
//! rayon, so the two paths agree bit-for-bit (asserted in the tests below).

#[cfg(feature = "parallel")]
use rayon::prelude::*;

// Interaction/integration constants, tuned so the field stays lively but bounded.
const CUTOFF: f32 = 34.0; // world units within which particles repel
const STRENGTH: f32 = 900.0; // repulsion magnitude scale
const DAMPING: f32 = 0.985; // per-step velocity retention
const MAX_SPEED: f32 = 240.0; // hard velocity clamp — keeps kinetic energy bounded
const MAX_DT: f32 = 1.0 / 30.0; // clamp long frames so a stall can't explode the sim

/// A box of particles that repel their near neighbours and bounce off the walls.
/// Positions/velocities are stored as parallel flat vectors (struct-of-arrays) so
/// the force pass is a cache-friendly map.
pub struct World {
    n: usize,
    pub w: f32,
    pub h: f32,
    px: Vec<f32>,
    py: Vec<f32>,
    vx: Vec<f32>,
    vy: Vec<f32>,
    rng: u64, // running counter-RNG state, so `set_count` growth stays reproducible
}

impl World {
    pub fn new(seed: u64, n: usize, w: f32, h: f32) -> Self {
        let mut world = World {
            n: 0,
            w: w.max(1.0),
            h: h.max(1.0),
            px: Vec::new(),
            py: Vec::new(),
            vx: Vec::new(),
            vy: Vec::new(),
            rng: seed ^ 0x9e37_79b9_7f4a_7c15,
        };
        world.set_count(n);
        world
    }

    pub fn count(&self) -> usize {
        self.n
    }

    /// Resize the world's viewport, clamping existing particles back inside it.
    pub fn set_viewport(&mut self, w: f32, h: f32) {
        self.w = w.max(1.0);
        self.h = h.max(1.0);
        for i in 0..self.n {
            self.px[i] = self.px[i].clamp(0.0, self.w);
            self.py[i] = self.py[i].clamp(0.0, self.h);
        }
    }

    /// Grow or shrink the particle set. Newly added particles are seeded from the
    /// running RNG so repeated growth is reproducible; shrinking just truncates.
    pub fn set_count(&mut self, n: usize) {
        if n < self.n {
            self.px.truncate(n);
            self.py.truncate(n);
            self.vx.truncate(n);
            self.vy.truncate(n);
        } else {
            for _ in self.n..n {
                let (rx, ry, rvx, rvy) = (
                    self.next_f32(),
                    self.next_f32(),
                    self.next_f32(),
                    self.next_f32(),
                );
                self.px.push(rx * self.w);
                self.py.push(ry * self.h);
                self.vx.push((rvx - 0.5) * MAX_SPEED);
                self.vy.push((rvy - 0.5) * MAX_SPEED);
            }
        }
        self.n = n;
    }

    /// One integration step. `parallel` selects the rayon force pass (identical
    /// result to the serial path — see `serial_matches_parallel`).
    pub fn step(&mut self, dt: f32, parallel: bool) {
        let dt = dt.clamp(0.0, MAX_DT);
        if dt == 0.0 || self.n == 0 {
            return;
        }
        let (ax, ay) = self.forces(parallel);
        for i in 0..self.n {
            let mut vx = (self.vx[i] + ax[i] * dt) * DAMPING;
            let mut vy = (self.vy[i] + ay[i] * dt) * DAMPING;
            let speed = (vx * vx + vy * vy).sqrt();
            if speed > MAX_SPEED {
                let s = MAX_SPEED / speed;
                vx *= s;
                vy *= s;
            }
            let mut x = self.px[i] + vx * dt;
            let mut y = self.py[i] + vy * dt;
            // Reflect off the walls, keeping the particle inside the box.
            if x < 0.0 {
                x = -x;
                vx = -vx;
            } else if x > self.w {
                x = 2.0 * self.w - x;
                vx = -vx;
            }
            if y < 0.0 {
                y = -y;
                vy = -vy;
            } else if y > self.h {
                y = 2.0 * self.h - y;
                vy = -vy;
            }
            self.px[i] = x.clamp(0.0, self.w);
            self.py[i] = y.clamp(0.0, self.h);
            self.vx[i] = vx;
            self.vy[i] = vy;
        }
    }

    /// Per-particle repulsion accumulated from neighbours within `CUTOFF`. Naïve
    /// O(n²), which is the point: it's the workload the compute backends race on.
    /// The closure is a pure function of read-only position state, so mapping it in
    /// parallel over `i` is a drop-in equivalent of the serial map.
    fn forces(&self, parallel: bool) -> (Vec<f32>, Vec<f32>) {
        let acc = |i: usize| -> (f32, f32) {
            let (xi, yi) = (self.px[i], self.py[i]);
            let mut fx = 0.0f32;
            let mut fy = 0.0f32;
            for j in 0..self.n {
                if j == i {
                    continue;
                }
                let dx = xi - self.px[j];
                let dy = yi - self.py[j];
                let d2 = dx * dx + dy * dy;
                if d2 >= CUTOFF * CUTOFF || d2 == 0.0 {
                    continue;
                }
                let d = d2.sqrt();
                // Soft linear repulsion, strongest at contact, zero at the cutoff.
                let mag = STRENGTH * (CUTOFF - d) / (CUTOFF * d);
                fx += dx * mag;
                fy += dy * mag;
            }
            (fx, fy)
        };

        #[cfg(feature = "parallel")]
        if parallel {
            let mut ax = vec![0.0f32; self.n];
            let mut ay = vec![0.0f32; self.n];
            ax.par_iter_mut()
                .zip(ay.par_iter_mut())
                .enumerate()
                .for_each(|(i, (axi, ayi))| {
                    let (fx, fy) = acc(i);
                    *axi = fx;
                    *ayi = fy;
                });
            return (ax, ay);
        }
        #[cfg(not(feature = "parallel"))]
        let _ = parallel; // the flag is inert without the feature

        let mut ax = vec![0.0f32; self.n];
        let mut ay = vec![0.0f32; self.n];
        for i in 0..self.n {
            let (fx, fy) = acc(i);
            ax[i] = fx;
            ay[i] = fy;
        }
        (ax, ay)
    }

    /// Fill `out` with `[x, y, hue]` per particle for the canvas to draw. `hue` is
    /// derived from speed (0 = slow/blue … 1 = fast/red), so the renderer needs no
    /// physics knowledge. Kept in the core so it's covered by the same tests.
    pub fn write_instances(&self, out: &mut Vec<f32>) {
        out.clear();
        out.reserve(self.n * 3);
        for i in 0..self.n {
            let speed = (self.vx[i] * self.vx[i] + self.vy[i] * self.vy[i]).sqrt();
            out.push(self.px[i]);
            out.push(self.py[i]);
            out.push((speed / MAX_SPEED).clamp(0.0, 1.0));
        }
    }

    /// SplitMix64-style counter RNG → f32 in [0, 1). No external dependency.
    fn next_f32(&mut self) -> f32 {
        self.rng = self.rng.wrapping_add(0x9e37_79b9_7f4a_7c15);
        let mut z = self.rng;
        z = (z ^ (z >> 30)).wrapping_mul(0xbf58_476d_1ce4_e5b9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94d0_49bb_1331_11eb);
        z ^= z >> 31;
        // Top 24 bits → a float in [0, 1) with no bias in the mantissa.
        ((z >> 40) as f32) / ((1u32 << 24) as f32)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn energy_stays_bounded() {
        let mut w = World::new(42, 400, 800.0, 600.0);
        for _ in 0..600 {
            w.step(1.0 / 60.0, false);
        }
        // Nothing escaped the box…
        for i in 0..w.count() {
            assert!(w.px[i] >= 0.0 && w.px[i] <= w.w, "x in box");
            assert!(w.py[i] >= 0.0 && w.py[i] <= w.h, "y in box");
        }
        // …and total kinetic energy is finite and under the clamp ceiling.
        let mut ke = 0.0f64;
        for i in 0..w.count() {
            let v2 = (w.vx[i] * w.vx[i] + w.vy[i] * w.vy[i]) as f64;
            assert!(v2.is_finite(), "velocity stayed finite");
            ke += 0.5 * v2;
        }
        let ceiling = 0.5 * (MAX_SPEED * MAX_SPEED) as f64 * w.count() as f64;
        assert!(ke <= ceiling, "KE {ke} within ceiling {ceiling}");
    }

    #[cfg(feature = "parallel")]
    #[test]
    fn serial_matches_parallel() {
        // Two worlds with the same seed, stepped identically except for the backend,
        // must remain bit-for-bit equal: the parallel force pass is a pure remap.
        let mut a = World::new(7, 500, 640.0, 480.0);
        let mut b = World::new(7, 500, 640.0, 480.0);
        for _ in 0..120 {
            a.step(1.0 / 60.0, false);
            b.step(1.0 / 60.0, true);
        }
        for i in 0..a.count() {
            assert_eq!(a.px[i].to_bits(), b.px[i].to_bits(), "px[{i}] bit-identical");
            assert_eq!(a.py[i].to_bits(), b.py[i].to_bits(), "py[{i}] bit-identical");
            assert_eq!(a.vx[i].to_bits(), b.vx[i].to_bits(), "vx[{i}] bit-identical");
            assert_eq!(a.vy[i].to_bits(), b.vy[i].to_bits(), "vy[{i}] bit-identical");
        }
    }

    #[test]
    fn set_count_grows_and_shrinks() {
        let mut w = World::new(1, 100, 500.0, 500.0);
        assert_eq!(w.count(), 100);
        w.set_count(250);
        assert_eq!(w.count(), 250);
        w.set_count(50);
        assert_eq!(w.count(), 50);
        let mut buf = Vec::new();
        w.write_instances(&mut buf);
        assert_eq!(buf.len(), 50 * 3);
    }
}

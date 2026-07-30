//! Landing-page engine core.
//!
//! Mirrors the sibling `../traffic` project's shape: one Rust crate compiled to
//! WebAssembly for the browser, split so the *simulation* ([`sim`]) is a pure,
//! native-testable core with no DOM/wasm/GPU, and the browser bridge is added behind
//! a `cfg(target_arch = "wasm32")` gate. There is deliberately no GPU path here — the
//! demo showcases the CPU-serial and CPU-threads backends only.

pub mod sim;

#[cfg(target_arch = "wasm32")]
mod bridge;

#[cfg(target_arch = "wasm32")]
pub use bridge::Simulation;

// Re-export so wasm-bindgen emits the `initThreadPool` JS entry point the browser
// awaits to spin up the rayon worker pool (the `wasm-threads` build only).
#[cfg(all(target_arch = "wasm32", feature = "wasm-threads"))]
pub use wasm_bindgen_rayon::init_thread_pool;

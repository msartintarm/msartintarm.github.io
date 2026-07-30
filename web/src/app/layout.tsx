import type { ReactNode } from "react";

export const metadata = {
  title: "msartintarm — games",
  description: "A small hub of browser games, driven by a Rust/WASM particle demo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0e13", color: "#e6edf3" }}>{children}</body>
    </html>
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // The hub is the site root (msartintarm.github.io/), so basePath is empty. Left
  // env-driven so a subpath preview build is still possible.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

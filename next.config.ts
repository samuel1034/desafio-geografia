import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalizamos @libsql/client para que webpack no intente bundlearlo
  // (tiene WASM y binarios nativos que deben correr directamente en Node.js)
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;

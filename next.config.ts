import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep defaults. The forecast API lives on its own origin
  // (NEXT_PUBLIC_API_URL) and is called directly from server components,
  // so no rewrites/proxying is needed here.
};

export default nextConfig;

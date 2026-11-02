import { withPathfinder } from "@pathfinder/config/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
};

export default withPathfinder(nextConfig);

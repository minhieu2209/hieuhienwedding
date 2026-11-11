import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chat apps such as Zalo need the complete preview metadata in the initial <head>.
  htmlLimitedBots: /.*/,
  images: {
    qualities: [75, 90, 95],
  },
};

export default nextConfig;

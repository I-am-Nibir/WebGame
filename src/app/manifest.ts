import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maisha Kids Arcade",
    short_name: "Maisha",
    description: "3D games for kids | বাচ্চাদের জন্য ৩ডি গেমস",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f8f6ff",
    theme_color: "#7c3aed",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}

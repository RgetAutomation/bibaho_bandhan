import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bangali Bibaho Bandhan",
    short_name: "Bibaho Bandhan",
    description:
      "Bangali Bibaho Bandhan — a Bengali matrimonial platform connecting families.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#e11d48", // Shadcn Rose (rose-600)
    scope: "/",
    categories: ["lifestyle", "social", "dating", "matrimonial"],
    // icons: [
    //   {
    //     src: "/icons/icon-192.png",
    //     sizes: "192x192",
    //     type: "image/png",
    //     purpose: "any",
    //   },
    //   {
    //     src: "/icons/icon-512.png",
    //     sizes: "512x512",
    //     type: "image/png",
    //     purpose: "any",
    //   },
    //   {
    //     src: "/icons/icon-512-maskable.png",
    //     sizes: "512x512",
    //     type: "image/png",
    //     purpose: "maskable",
    //   },
    // ],
  };
}

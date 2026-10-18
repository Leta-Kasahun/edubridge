import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EduBridge",
    short_name: "EduBridge",
    description: "EduBridge Education Platform",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F8FAFC",
    theme_color: "#0EA5E9",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Assessments",
        url: "/dashboard/assessments",
      },
      {
        name: "Learning Materials",
        url: "/dashboard/learning-content/materials",
      },
      {
        name: "Bookmarks",
        url: "/dashboard/bookmarks",
      },
    ],
  };
}

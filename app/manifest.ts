import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReviewFlow",
    short_name: "ReviewFlow",
    description: "Turn genuine customer feedback into authentic reviews with Google Gemini.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F5",
    theme_color: "#1A1918",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}

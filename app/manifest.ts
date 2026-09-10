import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReviewFlow — Turn Customer Feedback into Authentic Reviews",
    short_name: "ReviewFlow",
    description: "Turn genuine customer feedback into authentic Google reviews with Gemini AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F5",
    theme_color: "#18181B",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

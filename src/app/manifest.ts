import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OT Calculator",
    short_name: "OT",
    description: "คำนวณและติดตามค่าล่วงเวลา",
    start_url: "/",
    display: "standalone",
    background_color: "#5B4BFF",
    theme_color: "#5B4BFF",
    lang: "th",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

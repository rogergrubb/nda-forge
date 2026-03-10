import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://getndaforge.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://getndaforge.com/success", lastModified: new Date(), changeFrequency: "never", priority: 0.2 },
  ];
}

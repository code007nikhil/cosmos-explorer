const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Cosmos Explorer",
  tagline: "Your window into the universe.",
  // Prefer an explicit URL, then Vercel's production domain, then localhost for development.
  url: process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : "http://localhost:3000"),
};

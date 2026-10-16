import type { ApodData } from "@/types";
/** Bundled sample entry. NOT a live NASA response. */
export const FALLBACK_APOD: ApodData = {
  date: "2000-01-01", title: "Sample entry: exploring the night sky", mediaType: "other", pageUrl: "https://science.nasa.gov/",
  explanation: "Live Astronomy Picture of the Day data is unavailable right now. This bundled sample stands in so the page keeps working. Open the NASA APOD site to see the real picture of the day.",
};

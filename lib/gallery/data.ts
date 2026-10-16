import type { GalleryItem } from "@/types";
const q = (s: string) => `https://images.nasa.gov/search?q=${encodeURIComponent(s)}`;
/** Curated manifest. imageUrl is optional; items without one render a labelled placeholder. Add stable NASA image URLs here. */
export const GALLERY: GalleryItem[] = [
  { id: "blue-marble", title: "The Blue Marble", category: "planets", description: "A composite view of Earth assembled from satellite observations.", credit: "NASA Earth Observatory", imageUrl: "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57723/globe_east_540.jpg", sourceUrl: q("blue marble") },
  { id: "pillars", title: "Pillars of Creation", category: "nebulae", description: "Towers of gas and dust in the Eagle Nebula, a region of star formation.", credit: "NASA, ESA, Hubble and Webb teams", sourceUrl: q("pillars of creation") },
  { id: "andromeda", title: "Andromeda Galaxy", category: "galaxies", description: "The nearest large spiral galaxy to the Milky Way.", credit: "NASA", sourceUrl: q("andromeda galaxy") },
  { id: "crab", title: "Crab Nebula", category: "nebulae", description: "The remnant of a supernova observed in the year 1054.", credit: "NASA, ESA", sourceUrl: q("crab nebula") },
  { id: "jupiter", title: "Jupiter and the Great Red Spot", category: "planets", description: "Jupiter's banded atmosphere and its long-lived storm.", credit: "NASA/JPL", sourceUrl: q("jupiter great red spot") },
  { id: "saturn", title: "Saturn's Rings", category: "planets", description: "Saturn's ring system imaged by the Cassini spacecraft.", credit: "NASA/JPL-Caltech/Space Science Institute", sourceUrl: q("saturn rings cassini") },
  { id: "sun", title: "The Active Sun", category: "stars", description: "Solar activity observed in extreme ultraviolet light.", credit: "NASA/SDO", sourceUrl: q("sun solar dynamics observatory") },
  { id: "webb-deep", title: "Webb's First Deep Field", category: "galaxies", description: "Thousands of galaxies in a tiny patch of sky.", credit: "NASA, ESA, CSA, STScI", sourceUrl: q("webb first deep field") },
  { id: "apollo11", title: "Apollo 11 on the Moon", category: "missions", description: "An astronaut on the lunar surface during the first crewed Moon landing.", credit: "NASA", sourceUrl: q("apollo 11") },
  { id: "perseverance", title: "Perseverance on Mars", category: "missions", description: "The Perseverance rover exploring Jezero Crater.", credit: "NASA/JPL-Caltech", sourceUrl: q("perseverance rover") },
];
export const CATEGORIES = ["galaxies", "nebulae", "planets", "stars", "missions"] as const;

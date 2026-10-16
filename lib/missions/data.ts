import type { Mission } from "@/types";
/** Static, curated data. Status was not live-verified; always follow the source link for current information. */
export const MISSIONS: Mission[] = [
  { id: "apollo", name: "Apollo", objective: "Land humans on the Moon and return them safely to Earth.", launchYear: 1967, status: "Completed (program 1961–1972; first crewed launch 1968)", url: "https://www.nasa.gov/apollo/" },
  { id: "voyager", name: "Voyager 1 and 2", objective: "Explore the outer planets and travel into interstellar space.", launchYear: 1977, status: "Check NASA for current status", url: "https://science.nasa.gov/mission/voyager/" },
  { id: "hubble", name: "Hubble Space Telescope", objective: "Observe the universe in visible, ultraviolet and near-infrared light.", launchYear: 1990, status: "Check NASA for current status", url: "https://science.nasa.gov/mission/hubble/" },
  { id: "jwst", name: "James Webb Space Telescope", objective: "Study the early universe, galaxies, stars and exoplanets in infrared light.", launchYear: 2021, status: "Check NASA for current status", url: "https://science.nasa.gov/mission/webb/" },
  { id: "perseverance", name: "Mars Perseverance", objective: "Search for signs of ancient life and collect samples on Mars.", launchYear: 2020, status: "Check NASA for current status", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" },
  { id: "curiosity", name: "Mars Curiosity", objective: "Assess whether Mars once had conditions suitable for microbial life.", launchYear: 2011, status: "Check NASA for current status", url: "https://science.nasa.gov/mission/msl-curiosity/" },
];

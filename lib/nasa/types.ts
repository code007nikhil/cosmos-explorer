export type { ApodData, ApodResult } from "@/types";
export class NasaError extends Error {
  constructor(message: string, public code: "rate_limit" | "network" | "invalid" | "upstream", public status = 502) { super(message); }
}

"use client";
import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";

/** Image with graceful fallback when the URL is missing or fails to load. */
export function RemoteImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // An image that failed before React hydrated never fires onError again, so check once on mount.
  useEffect(() => { const el = ref.current; if (el && el.complete && el.naturalWidth === 0) setFailed(true); }, [src]);
  if (!src || failed) {
    return (
      <div role="img" aria-label={`${alt} (image unavailable)`} className={`flex items-center justify-center bg-gradient-to-br from-navy to-plasma/30 text-slate-400 ${className}`}>
        <ImageOff className="h-8 w-8" aria-hidden />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: "Explore an interactive 3D solar system, NASA's Astronomy Picture of the Day, space imagery and missions.",
  openGraph: { title: SITE.name, description: SITE.tagline, type: "website", siteName: SITE.name },
  alternates: { canonical: "/" },
};
export const viewport: Viewport = { themeColor: "#05070f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ion focus:p-2">Skip to content</a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

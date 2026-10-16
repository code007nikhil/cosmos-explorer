const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "\u2019", lsquo: "\u2018", rdquo: "\u201d", ldquo: "\u201c", ndash: "\u2013", mdash: "\u2014", hellip: "\u2026" };

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Converts a small HTML fragment to plain text. Output is always rendered as text by React, never as HTML. */
export function htmlToText(html: string): string {
  return decodeEntities(
    html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]*>/g, ""),
  ).replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Cleans an APOD explanation: plain text, without the "Explanation:" label, NASA site notices, or the "Tomorrow's picture" teaser. */
export function cleanExplanation(html: string): string {
  return htmlToText(html).replace(/^Explanation:\s*/i, "").replace(/\s*APOD['\u2019]s (email for image submissions|main NASA site).*$/is, "").replace(/\s*Tomorrow['\u2019]s picture:.*$/is, "").trim();
}

/** Single-line plain text for credit and copyright fields. */
export const cleanInline = (html: string): string => htmlToText(html).replace(/\s+/g, " ");

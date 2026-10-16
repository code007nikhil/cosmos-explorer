"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { localSearch } from "@/lib/search";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => localSearch.search(q), [q]);
  useEffect(() => { if (open) { setQ(""); setActive(0); setTimeout(() => input.current?.focus(), 0); } }, [open]);
  if (!open) return null;
  const go = (href: string) => { onClose(); router.push(href); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) go(results[active].href);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[12vh]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Search Cosmos Explorer" className="surface w-full max-w-xl bg-navy" onKeyDown={onKey}>
        <div className="flex items-center gap-2 border-b border-slate-700/60 p-3">
          <Search className="h-5 w-5 text-slate-400" aria-hidden />
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} placeholder="Search planets, missions, images" aria-label="Search" role="combobox" aria-expanded={results.length > 0} aria-controls="search-list" className="w-full bg-transparent text-white outline-none placeholder:text-slate-500" />
          <button onClick={onClose} aria-label="Close search" className="rounded p-1 hover:bg-white/10"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        <ul id="search-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
          {results.map((r, i) => (
            <li key={r.id} role="option" aria-selected={i === active}>
              <button className={`w-full rounded-lg p-3 text-left ${i === active ? "bg-ion/20" : "hover:bg-white/5"}`} onMouseEnter={() => setActive(i)} onClick={() => go(r.href)}>
                <span className="font-semibold">{r.title}</span> <span className="text-xs text-slate-400">{r.kind}</span>
                <span className="line-clamp-1 block text-sm text-slate-400">{r.description}</span>
              </button>
            </li>
          ))}
        </ul>
        {q.trim() && results.length === 0 && <p className="p-6 text-center text-slate-400">No results for “{q}”. Try a planet name like Mars.</p>}
        {!q.trim() && <p className="p-6 text-center text-slate-500">Start typing to search. Use ↑ ↓ and Enter to pick a result.</p>}
      </div>
    </div>
  );
}

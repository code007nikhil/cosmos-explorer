"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Orbit, Camera, Images, Rocket, Heart, Info, Menu, X, Search, PanelLeftClose, PanelLeftOpen, Telescope, Globe } from "lucide-react";
import { SearchDialog } from "@/components/search/SearchDialog";
import { Footer } from "./Footer";

const NAV = [
  { href: "/", label: "Home", icon: Home }, { href: "/solar-system", label: "Solar System", icon: Orbit },
  { href: "/apod", label: "Picture of the Day", icon: Camera }, { href: "/earth", label: "Earth", icon: Globe }, { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/missions", label: "Missions", icon: Rocket }, { href: "/favorites", label: "Favorites", icon: Heart }, { href: "/about", label: "About", icon: Info },
];

function Logo() {
  return <Link href="/" className="flex items-center gap-2 font-semibold text-white"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-ion to-plasma"><Telescope className="h-4 w-4" aria-hidden /></span>Cosmos Explorer</Link>;
}

function NavLinks({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href) || (href === "/solar-system" && path.startsWith("/planet"));
        return (
          <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={label}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active ? "bg-ion/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden />{!collapsed && label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col gap-6 border-r border-slate-800 bg-void/80 p-3 md:flex ${collapsed ? "w-16" : "w-60"}`}>
        {collapsed ? <span className="mx-auto mt-1"><Telescope className="h-6 w-6 text-ion" aria-label="Cosmos Explorer" /></span> : <div className="px-2 pt-1"><Logo /></div>}
        <NavLinks collapsed={collapsed} />
        <button onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="mt-auto rounded-lg p-2 text-slate-400 hover:bg-white/5">
          {collapsed ? <PanelLeftOpen className="h-5 w-5" aria-hidden /> : <PanelLeftClose className="h-5 w-5" aria-hidden />}
        </button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-800 bg-void/85 px-4 py-3 backdrop-blur">
          <button className="rounded-lg p-2 hover:bg-white/10 md:hidden" aria-label="Open navigation menu" onClick={() => setDrawer(true)}><Menu className="h-5 w-5" aria-hidden /></button>
          <div className="md:hidden"><Logo /></div>
          <button onClick={() => setSearch(true)} className="ml-auto flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:bg-white/5 md:w-72" aria-label="Open search">
            <Search className="h-4 w-4" aria-hidden /><span className="hidden md:inline">Search planets, missions…</span>
          </button>
          <Link href="/solar-system" className="btn btn-primary hidden sm:inline-flex">Explore</Link>
        </header>
        <main id="main" className="flex-1 px-4 py-8 sm:px-8">{children}</main>
        <Footer />
      </div>
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden" onKeyDown={(e) => e.key === "Escape" && setDrawer(false)}>
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} />
          <div role="dialog" aria-modal="true" aria-label="Navigation" className="absolute left-0 top-0 h-full w-72 bg-navy p-4">
            <div className="mb-6 flex items-center justify-between"><Logo /><button aria-label="Close navigation menu" autoFocus onClick={() => setDrawer(false)} className="rounded p-1 hover:bg-white/10"><X className="h-5 w-5" aria-hidden /></button></div>
            <NavLinks onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </div>
  );
}

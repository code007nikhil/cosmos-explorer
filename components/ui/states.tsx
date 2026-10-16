import type { ReactNode } from "react";
import { AlertTriangle, Loader2, Inbox } from "lucide-react";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>{subtitle && <p className="mt-2 max-w-2xl text-slate-400">{subtitle}</p>}</div>
      {children}
    </header>
  );
}
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <div role="status" className="flex items-center justify-center gap-3 p-10 text-slate-300"><Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden />{label}</div>;
}
export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="surface flex flex-col items-start gap-3 p-6">
      <div className="flex items-center gap-2 font-semibold text-amber-300"><AlertTriangle className="h-5 w-5" aria-hidden />{title}</div>
      <p className="text-slate-300">{message}</p>
      {onRetry && <button className="btn btn-ghost" onClick={onRetry}>Try again</button>}
    </div>
  );
}
export function EmptyState({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  return (
    <div className="surface flex flex-col items-center gap-2 p-10 text-center">
      <Inbox className="h-8 w-8 text-slate-500" aria-hidden /><h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-md text-slate-400">{message}</p>{children}
    </div>
  );
}

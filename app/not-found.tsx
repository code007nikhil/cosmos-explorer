import Link from "next/link";
import { EmptyState } from "@/components/ui/states";
export default function NotFound() {
  return <EmptyState title="Lost in space" message="We couldn't find that page."><Link href="/" className="btn btn-primary mt-3">Back to home</Link></EmptyState>;
}

import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { Home, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found — Learning Journey" description="The page you're looking for doesn't exist." />
      <section className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-7xl sm:text-8xl font-bold text-[#F38020] leading-none tracking-tight ">404</div>
        <div className="mt-2 inline-flex items-center px-3 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider text-[#F38020] bg-[var(--accent-soft)] border border-[var(--accent-border)]">
          Page not found
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
          This page took an unscheduled detour.
        </h1>
        <p className="mt-3 text-slate-400 leading-relaxed">
          The link might be broken, or the post never existed. Try one of these instead:
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link data-testid="404-home-btn" to="/" className="inline-flex items-center gap-2 bg-[#F38020] text-white font-semibold px-4 py-2 rounded hover:bg-[#FF9E45] transition-colors">
            <Home className="w-4 h-4" /> Back home
          </Link>
          <Link data-testid="404-posts-btn" to="/posts" className="inline-flex items-center gap-2 bg-[var(--bg-2)] text-slate-100 font-semibold px-4 py-2 rounded border border-[var(--border-2)] hover:border-[#F38020]/60">
            <Compass className="w-4 h-4" /> Browse all posts
          </Link>
        </div>
      </section>
    </>
  );
}

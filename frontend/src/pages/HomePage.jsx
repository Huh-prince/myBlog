import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import PostCard from "../components/PostCard";
import Seo from "../components/Seo";
import { ArrowRight, Sparkles, BookOpen, Code2 } from "lucide-react";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([api.get("/posts"), api.get("/posts/tags")]);
        setPosts(p.data);
        setTags(t.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <Seo title="Learning Journey — a weekly log of what I learned" description="Notes, code, and small ideas I picked up each week — on systems, the web, and engineering." />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--border-1)]">
        <div className="hero-glow" aria-hidden="true" />
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[#F38020] text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> A weekly learning log
            </div>
            <h1 data-testid="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-50 leading-[1.05]">
              Notes from the things <br className="hidden sm:block" />
              I learn each week.
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl">
              A no-nonsense log of code, systems, and small ideas — written down so I remember them,
              and maybe so you find one useful too.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link data-testid="hero-cta-read" to="/posts" className="inline-flex items-center gap-2 bg-[#F38020] text-white font-semibold px-5 py-2.5 rounded hover:bg-[#FF9E45] transition-colors ">
                Browse all posts <ArrowRight className="w-4 h-4" />
              </Link>
              <Link data-testid="hero-cta-tags" to="/tags" className="inline-flex items-center gap-2 bg-[var(--bg-2)] text-slate-100 font-semibold px-5 py-2.5 rounded border border-[var(--border-2)] hover:border-[#F38020]/60 hover:bg-[var(--bg-3)] transition-colors">
                Explore topics
              </Link>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-14 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl">
            <Stat icon={<BookOpen className="w-4 h-4" />} value={posts.length} label="Posts written" />
            <Stat icon={<Code2 className="w-4 h-4" />} value={tags.length} label="Topics covered" />
            <Stat icon={<Sparkles className="w-4 h-4" />} value="weekly" label="Cadence" />
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {loading ? (
          <div className="text-slate-400">Loading posts…</div>
        ) : posts.length === 0 ? (
          <div className="text-slate-400">No posts yet. The admin will publish soon.</div>
        ) : (
          <>
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="text-xs font-semibold text-[#F38020] uppercase tracking-wider mb-1">Latest</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">Most recent learning</h2>
              </div>
              <Link to="/posts" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#F38020] hover:underline">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {featured && <PostCard post={featured} featured />}

            {rest.length > 0 && (
              <>
                <div className="mt-16 mb-6">
                  <div className="text-xs font-semibold text-[#F38020] uppercase tracking-wider mb-1">More learnings</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">Keep reading</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((p) => <PostCard key={p.id} post={p} />)}
                </div>
              </>
            )}

            {tags.length > 0 && (
              <div className="mt-20 p-6 sm:p-8 bg-[var(--bg-2)] border border-[var(--border-1)] rounded">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold text-[#F38020] uppercase tracking-wider mb-1">Browse by topic</div>
                    <h3 className="text-xl font-bold text-slate-100 tracking-tight">Popular tags</h3>
                  </div>
                  <Link to="/tags" className="text-sm font-semibold text-[#F38020] hover:underline">All topics</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 14).map((t) => (
                    <Link key={t.tag} data-testid={`tag-${t.tag}`} to={`/tags/${encodeURIComponent(t.tag)}`} className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-[var(--bg-3)] text-slate-200 border border-[var(--border-1)] hover:border-[#F38020] hover:text-[#F38020] transition-colors">
                      {t.tag} <span className="ml-1.5 text-slate-500">{t.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="border-l-2 border-[#F38020] pl-3 sm:pl-4">
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {icon} {label}
      </div>
      <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">{value}</div>
    </div>
  );
}

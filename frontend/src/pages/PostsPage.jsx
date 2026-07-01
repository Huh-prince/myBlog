import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import PostCard from "../components/PostCard";
import Seo from "../components/Seo";
import { Search, X } from "lucide-react";

export default function PostsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const params = {};
    if (debounced) params.q = debounced;
    if (activeTag) params.tag = activeTag;
    setSearchParams(params, { replace: true });
    setLoading(true);
    api.get("/posts", { params }).then((r) => {
      setPosts(r.data);
      setLoading(false);
    });
  }, [debounced, activeTag]); // eslint-disable-line

  useEffect(() => {
    api.get("/posts/tags").then((r) => setTags(r.data));
  }, []);

  return (
    <>
      <Seo title="All posts — Learning Journey" description="Search and browse every weekly learning post." />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="text-xs font-semibold text-[#F38020] uppercase tracking-wider mb-1">All posts</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">Every learning, indexed.</h1>
        <p className="mt-3 text-slate-400 max-w-2xl">Search by keyword, or filter by topic. {posts.length} {posts.length === 1 ? "post" : "posts"}.</p>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              data-testid="posts-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search posts, tags, content…"
              className="w-full pl-9 pr-9 py-2.5 rounded border border-[var(--border-1)] bg-[var(--bg-2)] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]"
            />
            {q && (
              <button data-testid="search-clear" onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                data-testid="filter-all"
                onClick={() => setActiveTag("")}
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${activeTag === "" ? "bg-[#F38020] text-white border-[#F38020]" : "bg-[var(--bg-2)] text-slate-200 border-[var(--border-1)] hover:border-[#F38020]"}`}
              >
                All
              </button>
              {tags.map((t) => (
                <button
                  key={t.tag}
                  data-testid={`filter-tag-${t.tag}`}
                  onClick={() => setActiveTag(t.tag === activeTag ? "" : t.tag)}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${activeTag === t.tag ? "bg-[#F38020] text-white border-[#F38020]" : "bg-[var(--bg-2)] text-slate-200 border-[var(--border-1)] hover:border-[#F38020]"}`}
                >
                  {t.tag} <span className="opacity-60 ml-1">{t.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-slate-400">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-10 border border-dashed border-[var(--border-2)] rounded text-center text-slate-400">
            No posts match your search. Try a different keyword or <Link to="/posts" className="text-[#F38020] underline">clear filters</Link>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </>
  );
}

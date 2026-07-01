import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import PostCard from "../components/PostCard";
import Seo from "../components/Seo";
import { Tag as TagIcon, ArrowLeft } from "lucide-react";

export default function TagPage() {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/posts", { params: { tag } }).then((r) => { setPosts(r.data); setLoading(false); });
  }, [tag]);

  return (
    <>
      <Seo title={`#${tag} — Learning Journey`} description={`Posts tagged ${tag}.`} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <Link to="/tags" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#F38020]">
          <ArrowLeft className="w-3.5 h-3.5" /> All topics
        </Link>
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#F38020] uppercase tracking-wider"><TagIcon className="w-3.5 h-3.5" /> Topic</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">#{tag}</h1>
        <p className="mt-2 text-slate-400">{posts.length} {posts.length === 1 ? "post" : "posts"} tagged with this topic.</p>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-slate-400">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-10 border border-dashed border-[var(--border-2)] rounded text-center text-slate-400">No posts found for this tag.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </>
  );
}

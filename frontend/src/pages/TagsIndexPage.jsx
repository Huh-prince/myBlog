import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import Seo from "../components/Seo";

export default function TagsIndexPage() {
  const [tags, setTags] = useState([]);
  useEffect(() => { api.get("/posts/tags").then((r) => setTags(r.data)); }, []);

  return (
    <>
      <Seo title="Topics — Learning Journey" description="Browse all topics." />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="text-xs font-semibold text-[#F38020] uppercase tracking-wider mb-1">Browse</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">Topics</h1>
        <p className="mt-2 text-slate-400">Every tag I've written about.</p>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {tags.length === 0 ? (
          <div className="text-slate-400">No topics yet.</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((t) => (
              <Link
                key={t.tag}
                data-testid={`tag-link-${t.tag}`}
                to={`/tags/${encodeURIComponent(t.tag)}`}
                className="px-4 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-2)] hover:border-[#F38020] hover:text-[#F38020] transition-colors"
              >
                <span className="font-medium text-slate-200">#{t.tag}</span>
                <span className="ml-2 text-xs text-slate-500">{t.count} {t.count === 1 ? "post" : "posts"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

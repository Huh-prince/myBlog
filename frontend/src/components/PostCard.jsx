import { Link } from "react-router-dom";
import { Clock, ArrowUpRight } from "lucide-react";
import { formatDate, readingTimeLabel } from "../lib/format";

export default function PostCard({ post, featured = false }) {
  if (featured) {
    return (
      <Link
        to={`/posts/${post.slug}`}
        data-testid="post-card-featured"
        className="group block bg-[var(--bg-2)] border border-[var(--border-1)] rounded overflow-hidden hover:border-[#F38020]/60 hover: transition-all duration-200"
      >
        <div className="grid md:grid-cols-5">
          {post.cover_image && (
            <div className="md:col-span-2 aspect-[16/10] md:aspect-auto overflow-hidden bg-[var(--bg-3)] relative">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--bg-2)]/30 pointer-events-none" />
            </div>
          )}
          <div className="md:col-span-3 p-6 sm:p-8 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[#F38020] border border-[var(--accent-border)] font-semibold uppercase tracking-wider">Featured</span>
              {post.tags?.slice(0, 2).map((t) => (
                <span key={t} className="text-slate-400 uppercase tracking-wider font-medium">{t}</span>
              ))}
            </div>
            <h2 className="font-extrabold text-2xl sm:text-3xl leading-tight text-slate-100 group-hover:text-[#F38020] transition-colors">
              {post.title}
            </h2>
            <p className="text-slate-400 leading-relaxed line-clamp-3">{post.excerpt}</p>
            <div className="mt-auto pt-2 flex items-center gap-4 text-xs text-slate-500">
              <span>{formatDate(post.created_at)}</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readingTimeLabel(post.reading_time)}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[#F38020] font-semibold">Read <ArrowUpRight className="w-3.5 h-3.5" /></span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/posts/${post.slug}`}
      data-testid="post-card"
      className="group flex flex-col bg-[var(--bg-2)] border border-[var(--border-1)] rounded overflow-hidden hover:border-[#F38020]/60 hover: hover:-translate-y-0.5 transition-all duration-200"
    >
      {post.cover_image && (
        <div className="aspect-[16/9] overflow-hidden bg-[var(--bg-3)]">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
        </div>
      )}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {post.tags?.slice(0, 3).map((t) => (
            <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-3)] text-slate-300 border border-[var(--border-1)]">
              {t}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-lg leading-snug text-slate-100 group-hover:text-[#F38020] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{post.excerpt}</p>
        <div className="mt-auto pt-2 flex items-center gap-3 text-xs text-slate-500">
          <span>{formatDate(post.created_at)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {readingTimeLabel(post.reading_time)}</span>
        </div>
      </div>
    </Link>
  );
}

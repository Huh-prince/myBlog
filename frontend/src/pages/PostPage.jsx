import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import MarkdownRenderer from "../components/MarkdownRenderer";
import PostCard from "../components/PostCard";
import Seo from "../components/Seo";
import { Clock, Calendar, ArrowLeft, MessageCircle } from "lucide-react";
import { formatDate, readingTimeLabel } from "../lib/format";
import { toast } from "sonner";

export default function PostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPost(null); setNotFound(false); setRelated([]);
    api.get(`/posts/${slug}`)
      .then((r) => setPost(r.data))
      .catch(() => setNotFound(true));
    api.get(`/posts/${slug}/related`)
      .then((r) => setRelated(r.data))
      .catch(() => {});
  }, [slug]);

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl font-bold text-[#F38020]">404</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-100">This post does not exist</h1>
        <p className="mt-2 text-slate-400">It may have been moved, renamed, or never published.</p>
        <button onClick={() => navigate("/posts")} className="mt-6 inline-flex items-center gap-2 text-[#F38020] font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Browse all posts
        </button>
      </div>
    );
  }

  if (!post) {
    return <div className="max-w-3xl mx-auto px-4 py-24 text-slate-400">Loading…</div>;
  }

  return (
    <>
      <Seo title={`${post.title} — Learning Journey`} description={post.excerpt} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <Link to="/posts" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#F38020]">
          <ArrowLeft className="w-3.5 h-3.5" /> All posts
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags?.map((t) => (
              <Link key={t} to={`/tags/${encodeURIComponent(t)}`} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider text-[#F38020] bg-[var(--accent-soft)] border border-[var(--accent-border)] hover:bg-[var(--accent-soft)]">
                {t}
              </Link>
            ))}
          </div>
          <h1 data-testid="post-title" className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-50 leading-[1.1]">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-4 text-lg text-slate-400 leading-relaxed">{post.excerpt}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500 border-t border-b border-[var(--border-1)] py-3">
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.created_at)}</span>
            <span className="inline-flex items-center gap-1.5" data-testid="reading-time"><Clock className="w-3.5 h-3.5" /> {readingTimeLabel(post.reading_time)}</span>
          </div>
        </header>

        {post.cover_image && (
          <div className="mt-8 rounded overflow-hidden border border-[var(--border-1)] bg-[var(--bg-3)]">
            <img src={post.cover_image} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        <div className="mt-10">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      {related.length > 0 && (
        <section data-testid="related-posts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[var(--border-1)]">
          <div className="text-xs font-semibold text-[#F38020] uppercase tracking-wider mb-1">Related learnings</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight mb-6">More posts you might like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </section>
      )}

      <Comments slug={slug} />
    </>
  );
}

function Comments({ slug }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get(`/posts/${slug}/comments`).then((r) => setComments(r.data)).catch(() => {});
  useEffect(() => { load(); }, [slug]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !body.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/posts/${slug}/comments`, { name, email, body });
      setName(""); setEmail(""); setBody("");
      toast.success("Comment posted!");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section data-testid="comments-section" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 border-t border-[var(--border-1)]">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-[#F38020]" />
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Comments ({comments.length})</h2>
      </div>

      <div className="space-y-4 mb-8">
        {comments.length === 0 && (
          <div className="text-slate-500 text-sm">Be the first to share your thoughts.</div>
        )}
        {comments.map((c) => (
          <div key={c.id} data-testid="comment-item" className="p-4 bg-[var(--bg-2)] border border-[var(--border-1)] rounded">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-[#F38020] text-white flex items-center justify-center text-xs font-bold">
                {(c.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="font-semibold text-sm text-slate-100">{c.name}</div>
              <div className="text-xs text-slate-500 ml-auto">{formatDate(c.created_at)}</div>
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{c.body}</div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="p-5 bg-[var(--bg-2)] border border-[var(--border-1)] rounded space-y-3">
        <div className="font-semibold text-slate-100">Leave a comment</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input data-testid="comment-name-input" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="px-3 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-1)] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]" />
          <input data-testid="comment-email-input" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (not shown)" className="px-3 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-1)] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]" />
        </div>
        <textarea data-testid="comment-body-input" name="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Your comment…" rows={4} className="w-full px-3 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-1)] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]" />
        <button data-testid="comment-submit-btn" disabled={submitting} type="submit" className="inline-flex items-center bg-[#F38020] text-white font-semibold px-4 py-2 rounded hover:bg-[#FF9E45] transition-colors disabled:opacity-60">
          {submitting ? "Posting…" : "Post comment"}
        </button>
      </form>
    </section>
  );
}

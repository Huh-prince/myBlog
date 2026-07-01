import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import MarkdownRenderer from "../components/MarkdownRenderer";
import Seo from "../components/Seo";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminPostEditor() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", tags: "", cover_image: "", published: true });
  const [tab, setTab] = useState("write");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        const { data } = await api.get("/admin/posts");
        const p = data.find((x) => x.id === id);
        if (!p) { toast.error("Post not found"); navigate("/admin"); return; }
        setForm({
          title: p.title,
          excerpt: p.excerpt || "",
          content: p.content || "",
          tags: (p.tags || []).join(", "),
          cover_image: p.cover_image || "",
          published: p.published,
        });
      } catch (e) {
        if (e.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]); // eslint-disable-line

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      cover_image: form.cover_image.trim(),
      published: form.published,
    };
    try {
      const res = editing
        ? await api.put(`/admin/posts/${id}`, payload)
        : await api.post(`/admin/posts`, payload);
      toast.success(editing ? "Post updated" : "Post published");
      navigate(`/posts/${res.data.slug}`);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-16 text-slate-400">Loading…</div>;

  return (
    <>
      <Seo title={`${editing ? "Edit" : "New"} post — Admin`} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#F38020] mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to admin
        </Link>

        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold text-[#F38020] uppercase tracking-wider mb-1">{editing ? "Edit post" : "New post"}</div>
            <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight">{editing ? "Refine your learning" : "Write a new learning"}</h1>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-3">
              <input
                data-testid="editor-title-input"
                placeholder="Post title…"
                value={form.title} onChange={onChange("title")}
                className="w-full px-4 py-3 rounded border border-[var(--border-1)] bg-[var(--bg-2)] text-slate-100 placeholder:text-slate-500 text-xl font-bold focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]"
              />
              <input
                data-testid="editor-excerpt-input"
                placeholder="Short excerpt (one or two sentences)"
                value={form.excerpt} onChange={onChange("excerpt")}
                className="w-full px-3 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-2)] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]"
              />
            </div>
            <div className="space-y-3">
              <input
                data-testid="editor-tags-input"
                placeholder="tags, comma-separated"
                value={form.tags} onChange={onChange("tags")}
                className="w-full px-3 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-2)] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]"
              />
              <input
                data-testid="editor-cover-input"
                placeholder="Cover image URL (optional)"
                value={form.cover_image} onChange={onChange("cover_image")}
                className="w-full px-3 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-2)] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]"
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input data-testid="editor-published-checkbox" type="checkbox" checked={form.published} onChange={onChange("published")} className="rounded accent-[#F38020]" />
                Published
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-[var(--border-1)]">
            <button type="button" data-testid="editor-tab-write" onClick={() => setTab("write")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === "write" ? "border-[#F38020] text-[#F38020]" : "border-transparent text-slate-400 hover:text-slate-100"}`}>Write</button>
            <button type="button" data-testid="editor-tab-preview" onClick={() => setTab("preview")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === "preview" ? "border-[#F38020] text-[#F38020]" : "border-transparent text-slate-400 hover:text-slate-100"}`}>
              <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Preview</span>
            </button>
            <button type="button" data-testid="editor-tab-split" onClick={() => setTab("split")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === "split" ? "border-[#F38020] text-[#F38020]" : "border-transparent text-slate-400 hover:text-slate-100"}`}>Split</button>
          </div>

          <div className={tab === "split" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : ""}>
            {(tab === "write" || tab === "split") && (
              <textarea
                data-testid="editor-content-textarea"
                value={form.content} onChange={onChange("content")}
                placeholder="# Write in Markdown…&#10;&#10;Use `code`, ```fenced blocks```, ![images](url), videos via embedded HTML, blockquotes, lists — anything MDX-style."
                rows={tab === "split" ? 24 : 22}
                className="w-full px-4 py-3 rounded border border-[var(--border-1)] font-mono text-sm leading-relaxed focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020] bg-[var(--bg-2)] text-slate-100 placeholder:text-slate-500"
              />
            )}
            {(tab === "preview" || tab === "split") && (
              <div className="border border-[var(--border-1)] rounded p-5 bg-[var(--bg-2)] overflow-auto" style={{ minHeight: tab === "split" ? "auto" : 400 }}>
                <MarkdownRenderer content={form.content} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button data-testid="editor-save-btn" type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#F38020] text-white font-semibold px-5 py-2.5 rounded hover:bg-[#FF9E45] transition-colors disabled:opacity-60">
              <Save className="w-4 h-4" /> {saving ? "Saving…" : editing ? "Update post" : "Publish post"}
            </button>
            <Link to="/admin" className="text-sm text-slate-400 hover:text-slate-100">Cancel</Link>
          </div>
        </form>
      </section>
    </>
  );
}

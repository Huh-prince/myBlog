import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import Seo from "../components/Seo";
import { Plus, Edit3, Trash2, Eye, EyeOff } from "lucide-react";
import { formatDate, readingTimeLabel } from "../lib/format";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.get("/admin/posts")
      .then((r) => setPosts(r.data))
      .catch((e) => {
        if (e.response?.status === 401) navigate("/login");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const remove = async (id) => {
    if (!window.confirm("Delete this post? This also deletes its comments.")) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      toast.success("Post deleted");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Delete failed");
    }
  };

  return (
    <>
      <Seo title="Admin — Learning Journey" />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#F38020] uppercase tracking-wider mb-1">Admin</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">Manage posts</h1>
          </div>
          <Link data-testid="new-post-btn" to="/admin/posts/new" className="inline-flex items-center gap-2 bg-[#F38020] text-white font-semibold px-4 py-2 rounded hover:bg-[#FF9E45] transition-colors">
            <Plus className="w-4 h-4" /> New post
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-10 border border-dashed border-[var(--border-2)] rounded text-center text-slate-400">
            No posts yet. <Link to="/admin/posts/new" className="text-[#F38020] underline">Write your first one.</Link>
          </div>
        ) : (
          <div className="bg-[var(--bg-2)] border border-[var(--border-1)] rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-3)] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Tags</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Created</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Reading</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} data-testid="admin-post-row" className="border-t border-[var(--border-1)] hover:bg-[var(--bg-3)]/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100 line-clamp-1">{p.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{p.slug}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.tags?.slice(0, 3).map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-3)] text-slate-300 border border-[var(--border-1)]">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs">{readingTimeLabel(p.reading_time)}</td>
                    <td className="px-4 py-3">
                      {p.published ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                          <Eye className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 bg-[var(--bg-3)] border border-[var(--border-1)] px-2 py-0.5 rounded">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/posts/edit/${p.id}`} data-testid="admin-edit-btn" className="p-1.5 rounded text-slate-300 hover:bg-[var(--bg-3)] hover:text-[#F38020]">
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button data-testid="admin-delete-btn" onClick={() => remove(p.id)} className="p-1.5 rounded text-slate-300 hover:bg-red-950/40 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

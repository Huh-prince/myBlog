import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, BookOpen, LogOut, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const t = q.trim();
    navigate(t ? `/posts?q=${encodeURIComponent(t)}` : "/posts");
  };

  return (
    <header data-testid="site-header" className="sticky top-0 z-50 w-full bg-[#0E1014]/85 backdrop-blur-md border-b border-[var(--border-1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-[#F38020] flex items-center justify-center text-white shrink-0 ">
            <BookOpen className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-100 group-hover:text-[#F38020] transition-colors">
            Learning<span className="text-[#F38020]">/</span>Journey
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 ml-4 text-sm font-medium">
          <NavLink data-testid="nav-home" to="/" end className={({ isActive }) => `nav-link text-slate-300 hover:text-white ${isActive ? "active text-white" : ""}`}>Home</NavLink>
          <NavLink data-testid="nav-posts" to="/posts" className={({ isActive }) => `nav-link text-slate-300 hover:text-white ${isActive ? "active text-white" : ""}`}>All posts</NavLink>
          <NavLink data-testid="nav-tags" to="/tags" className={({ isActive }) => `nav-link text-slate-300 hover:text-white ${isActive ? "active text-white" : ""}`}>Topics</NavLink>
        </nav>

        <form onSubmit={submit} className="ml-auto flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={2} />
            <input
              data-testid="header-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search learnings…"
              className="w-full pl-9 pr-3 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-2)] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020] transition-colors"
            />
          </div>
        </form>


      </div>
    </header>
  );
}

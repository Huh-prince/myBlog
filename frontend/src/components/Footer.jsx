import { Link } from "react-router-dom";
import { Rss, Github, Mail, KeyRound, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="bg-[#0E1014] border-t border-[var(--border-1)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="font-extrabold text-lg tracking-tight text-slate-100">
              Learning<span className="text-[#F38020]">/</span>Journey
            </div>
            <p className="text-sm text-slate-400 mt-3 max-w-md leading-relaxed">
              A weekly log of what I learned — code, systems, and the small ideas that shipped me forward.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/posts" className="text-slate-400 hover:text-[#F38020]">All posts</Link></li>
              <li><Link to="/tags" className="text-slate-400 hover:text-[#F38020]">Topics</Link></li>
              <li>
                <Link data-testid="footer-signin-link" to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#F38020]">
                   Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Subscribe</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a data-testid="rss-link" href={`${process.env.REACT_APP_BACKEND_URL}/api/rss.xml`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#F38020]">
                  <Rss className="w-4 h-4" /> RSS feed
                </a>
              </li>
              <li><a href="#" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#F38020]"><Github className="w-4 h-4" /> GitHub</a></li>
              <li><a href="mailto:hello@learning.dev" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#F38020]"><Mail className="w-4 h-4" /> Email</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border-1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Learning Journey. Built with curiosity.</div>
          <div>A personal learning log.</div>
        </div>
      </div>
    </footer>
  );
}

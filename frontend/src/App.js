import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { Toaster } from "sonner";
import SiteLayout from "./components/SiteLayout";
import HomePage from "./pages/HomePage";
import PostsPage from "./pages/PostsPage";
import PostPage from "./pages/PostPage";
import TagPage from "./pages/TagPage";
import TagsIndexPage from "./pages/TagsIndexPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPostEditor from "./pages/AdminPostEditor";
import NotFoundPage from "./pages/NotFoundPage";

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="max-w-3xl mx-auto px-4 py-24 text-slate-400">Checking session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <SiteLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/posts/:slug" element={<PostPage />} />
              <Route path="/tags" element={<TagsIndexPage />} />
              <Route path="/tags/:tag" element={<TagPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
              <Route path="/admin/posts/new" element={<RequireAdmin><AdminPostEditor /></RequireAdmin>} />
              <Route path="/admin/posts/edit/:id" element={<RequireAdmin><AdminPostEditor /></RequireAdmin>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </SiteLayout>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

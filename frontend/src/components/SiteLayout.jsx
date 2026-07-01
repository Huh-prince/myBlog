import Header from "./Header";
import Footer from "./Footer";

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-1)]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

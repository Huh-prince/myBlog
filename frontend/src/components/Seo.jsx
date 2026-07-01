import { useEffect } from "react";

export default function Seo({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
      }
      m.setAttribute("content", description);
    }
    // OG tags
    const setMeta = (prop, val) => {
      if (!val) return;
      let m = document.querySelector(`meta[property="${prop}"]`);
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("property", prop);
        document.head.appendChild(m);
      }
      m.setAttribute("content", val);
    };
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:type", "article");
  }, [title, description]);
  return null;
}

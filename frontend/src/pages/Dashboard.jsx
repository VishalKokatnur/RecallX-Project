import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import fileService from "../services/fileService.js";
import searchService from "../services/searchService.js";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [quickQuery, setQuickQuery] = useState("");

  useEffect(() => {
    fileService.listFiles(1).then((data) => {
      setFiles(data.results || []);
      setTotalCount(data.count || 0);
    }).catch(() => {});

    searchService.getHistory().then(setRecentSearches).catch(() => {});
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    navigate("/search");
  };

  const counts = {
    total: totalCount,
    images: files.filter((f) => f.file_type === "image").length,
    docs: files.filter((f) => f.file_type === "pdf" || f.file_type === "docx").length,
  };

  const recentUploads = [...files]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <p className="text-muted mb-1">Welcome back, {user?.username}</p>
      <h1 className="font-display text-3xl mb-6">What are you trying to remember?</h1>

      <form onSubmit={handleQuickSearch} className="flex gap-2 mb-10">
        <input
          value={quickQuery}
          onChange={(e) => setQuickQuery(e.target.value)}
          placeholder="Search your memories..."
          className="flex-1 border border-line rounded-lg px-3 py-2.5 focus:outline-none focus:border-ink transition-colors"
        />
        <button type="submit" className="bg-ink text-paper rounded-lg px-5 py-2.5 hover:bg-ink/90 transition-colors">
          Search
        </button>
      </form>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border border-line rounded-lg p-5 text-center">
          <p className="font-display text-3xl">{counts.total}</p>
          <p className="text-xs text-muted mt-1">Total files</p>
        </div>
        <div className="border border-line rounded-lg p-5 text-center">
          <p className="font-display text-3xl">{counts.images}</p>
          <p className="text-xs text-muted mt-1">Screenshots</p>
        </div>
        <div className="border border-line rounded-lg p-5 text-center">
          <p className="font-display text-3xl">{counts.docs}</p>
          <p className="text-xs text-muted mt-1">Documents</p>
        </div>
      </div>

      <div className="flex gap-3 mb-10">
        <button onClick={() => navigate("/upload")} className="border border-line rounded-lg px-4 py-2 text-sm hover:border-ink transition-colors">
          Upload a file
        </button>
        <button onClick={() => navigate("/files")} className="border border-line rounded-lg px-4 py-2 text-sm hover:border-ink transition-colors">
          View all files
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-medium text-sm mb-3 pb-2 border-b border-line">Recent uploads</h2>
          {recentUploads.length === 0 && <p className="text-sm text-muted">No files yet.</p>}
          <ul>
            {recentUploads.map((f) => (
              <li key={f.id} className="flex justify-between items-center text-sm py-2.5 border-b border-line last:border-0">
                <span className="truncate">{f.file_name}</span>
                <span className="text-muted text-xs shrink-0 ml-2">{f.file_type}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-medium text-sm mb-3 pb-2 border-b border-line">Recent searches</h2>
          {recentSearches.length === 0 && <p className="text-sm text-muted">No searches yet.</p>}
          <ul>
            {recentSearches.map((s) => (
              <li key={s.id} className="text-sm py-2.5 border-b border-line last:border-0 truncate text-muted">
                "{s.query}"
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
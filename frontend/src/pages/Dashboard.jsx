import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import fileService from "../services/fileService.js";
import searchService from "../services/searchService.js";

export default function Dashboard() {
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">RecallX</h1>
        <button onClick={handleLogout} className="border border-gray-300 rounded-md px-4 py-2 text-sm">
          Log out
        </button>
      </div>

      <p className="text-gray-500 mb-2">Welcome, {user?.username}</p>
      <h2 className="text-xl font-medium mb-4">What are you trying to remember?</h2>

      <form onSubmit={handleQuickSearch} className="flex gap-2 mb-8">
        <input
          value={quickQuery}
          onChange={(e) => setQuickQuery(e.target.value)}
          placeholder="Search your memories..."
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button type="submit" className="bg-black text-white rounded-md px-5 py-2">
          Search
        </button>
      </form>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-md p-4 text-center">
          <p className="text-2xl font-semibold">{counts.total}</p>
          <p className="text-xs text-gray-500">Total Files</p>
        </div>
        <div className="border rounded-md p-4 text-center">
          <p className="text-2xl font-semibold">{counts.images}</p>
          <p className="text-xs text-gray-500">Screenshots</p>
        </div>
        <div className="border rounded-md p-4 text-center">
          <p className="text-2xl font-semibold">{counts.docs}</p>
          <p className="text-xs text-gray-500">Documents</p>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <button onClick={() => navigate("/upload")} className="border rounded-md px-4 py-2 text-sm">
          Upload a file
        </button>
        <button onClick={() => navigate("/files")} className="border rounded-md px-4 py-2 text-sm">
          View all files
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent uploads</h3>
          {recentUploads.length === 0 && <p className="text-sm text-gray-400">No files yet.</p>}
          <ul className="space-y-2">
            {recentUploads.map((f) => (
              <li key={f.id} className="text-sm border rounded-md p-2 flex justify-between">
                <span className="truncate">{f.file_name}</span>
                <span className="text-gray-400 text-xs shrink-0 ml-2">{f.file_type}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent searches</h3>
          {recentSearches.length === 0 && <p className="text-sm text-gray-400">No searches yet.</p>}
          <ul className="space-y-2">
            {recentSearches.map((s) => (
              <li key={s.id} className="text-sm border rounded-md p-2 truncate">
                "{s.query}"
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
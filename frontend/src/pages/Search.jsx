import { useState } from "react";
import searchService from "../services/searchService.js";

export default function Search() {
  const [query, setQuery] = useState("");
  const [fileType, setFileType] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const data = await searchService.search({
        query,
        file_type: fileType || null,
        date_filter: dateFilter || null,
      });
      setResults(data.results);
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">What are you trying to remember?</h1>
      <p className="text-gray-500 mb-6">Search your files by meaning, not keywords.</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find that Docker deployment guide I saved..."
          className="flex-1 border rounded-md px-3 py-2"
        />
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="border rounded-md px-2 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="image">Image</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="txt">TXT</option>
        </select>
                <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border rounded-md px-2 py-2 text-sm"
        >
          <option value="">Any time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last_week">Last week</option>
          <option value="last_month">Last month</option>
          <option value="last_year">Last year</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded-md px-5 py-2 disabled:opacity-50"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {searched && !loading && results.length === 0 && !error && (
        <p className="text-gray-500">No matches found.</p>
      )}

      <ul className="space-y-3">
        {results.map((r, i) => (
          <li key={i} className="border rounded-md p-4">
            <div className="flex justify-between items-start mb-1">
              <p className="font-medium">{r.file_name}</p>
              <span className="text-xs text-gray-400 shrink-0 ml-2">
                {(r.similarity_score * 100).toFixed(0)}% match
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{r.file_type}</p>
            <p className="text-sm text-gray-600 line-clamp-3">{r.matched_text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
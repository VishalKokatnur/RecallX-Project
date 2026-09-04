import { useEffect, useState } from "react";
import fileService from "../services/fileService.js";

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const loadFiles = async (pageNum) => {
    setLoading(true);
    try {
      const data = await fileService.listFiles(pageNum);
      setFiles(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      setError("Could not load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(page);
  }, [page]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this file?")) return;
    await fileService.deleteFile(id);
    loadFiles(page);
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === "name") return a.file_name.localeCompare(b.file_name);
    if (sortBy === "type") return a.file_type.localeCompare(b.file_type);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your files</h1>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-md px-2 py-1 text-sm">
          <option value="date">Newest first</option>
          <option value="name">Name (A-Z)</option>
          <option value="type">File type</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && files.length === 0 && <p className="text-gray-500">No files uploaded yet.</p>}

      <ul className="space-y-2">
        {sortedFiles.map((f) => (
          <li key={f.id} className="border rounded-md p-4 flex items-center gap-4">
            {f.file_type === "image" ? (
              <img src={f.file} alt={f.file_name} className="w-14 h-14 object-cover rounded-md border shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-md border shrink-0 flex items-center justify-center text-xs text-gray-400 uppercase">{f.file_type}</div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{f.file_name}</p>
              <p className="text-xs text-gray-400">{(f.file_size / 1024).toFixed(1)} KB - {f.processing_status} - {new Date(f.created_at).toLocaleDateString()}</p>
              {f.tags && f.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {f.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <a href={f.file} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline shrink-0">View</a>

            <button onClick={() => handleDelete(f.id)} className="text-sm text-red-600 hover:underline shrink-0">Delete</button>
          </li>
        ))}
      </ul>

      {count > pageSize && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-sm border rounded-md px-3 py-1 disabled:opacity-40">
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-sm border rounded-md px-3 py-1 disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
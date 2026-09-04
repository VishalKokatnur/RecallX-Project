import { useEffect, useState } from "react";
import fileService from "../services/fileService.js";

function groupByMonth(files) {
  const groups = {};
  for (const f of files) {
    const d = new Date(f.created_at);
    const key = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  }
  return groups;
}

export default function Timeline() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fileService.listFiles().then((data) => setFiles(data.results || [])).finally(() => setLoading(false));
  }, []);

  const groups = groupByMonth(files);
  const monthKeys = Object.keys(groups);

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Knowledge Timeline</h1>
      <p className="text-gray-500 mb-8">Everything you've saved, organized by when you saved it.</p>

      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && monthKeys.length === 0 && <p className="text-gray-500">No files yet.</p>}

      <div className="space-y-8">
        {monthKeys.map((month) => (
          <div key={month}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 sticky top-0 bg-white py-1">
              {month}
            </h2>
            <div className="border-l-2 border-gray-200 pl-4 space-y-3">
              {groups[month].map((f) => (
                <div key={f.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-black -ml-[21px]"></div>
                  {f.file_type === "image" ? (
                    <img src={f.file} alt={f.file_name} className="w-10 h-10 object-cover rounded-md border" />
                  ) : (
                    <div className="w-10 h-10 rounded-md border flex items-center justify-center text-[10px] text-gray-400 uppercase">
                      {f.file_type}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.file_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(f.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <a href={f.file} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
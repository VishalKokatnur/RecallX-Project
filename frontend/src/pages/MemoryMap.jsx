import { useEffect, useState } from "react";
import memoryMapService from "../services/memoryMapService.js";

const COLORS = [
  "bg-blue-50 border-blue-200",
  "bg-green-50 border-green-200",
  "bg-purple-50 border-purple-200",
  "bg-yellow-50 border-yellow-200",
  "bg-pink-50 border-pink-200",
  "bg-orange-50 border-orange-200",
];

export default function MemoryMap() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memoryMapService.getMemoryMap()
      .then((data) => setClusters(data.clusters || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Memory Map</h1>
      <p className="text-gray-500 mb-8">
        Your saved files, clustered by shared topics. Each group shows what RecallX has learned connects them.
      </p>

      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && clusters.length === 0 && (
        <p className="text-gray-500">No tagged files yet. Upload a few files to build your memory map.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {clusters.map((cluster, i) => (
          <div key={cluster.tag} className={`border rounded-xl p-4 ${COLORS[i % COLORS.length]}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm uppercase tracking-wide">{cluster.tag}</h2>
              <span className="text-xs text-gray-500">{cluster.files.length} file{cluster.files.length !== 1 ? "s" : ""}</span>
            </div>
            <ul className="space-y-1">
              {cluster.files.map((f) => (
                <li key={f.id} className="text-sm bg-white rounded-md px-3 py-2 flex justify-between border">
                  <span className="truncate">{f.file_name}</span>
                  <span className="text-gray-400 text-xs shrink-0 ml-2">{f.file_type}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
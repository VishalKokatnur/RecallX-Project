import { useState } from "react";
import UploadArea from "../components/UploadArea.jsx";

export default function Upload() {
  const [uploaded, setUploaded] = useState([]);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Upload a file</h1>
      <UploadArea onUploaded={(file) => setUploaded((prev) => [file, ...prev])} />

      {uploaded.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Uploaded just now</h2>
          <ul className="space-y-2">
            {uploaded.map((f) => (
              <li key={f.id} className="border rounded-md p-3 text-sm flex justify-between">
                <span>{f.file_name}</span>
                <span className="text-gray-400">{f.file_type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
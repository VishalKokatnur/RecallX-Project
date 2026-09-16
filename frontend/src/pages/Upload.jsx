import { useState } from "react";
import UploadArea from "../components/UploadArea.jsx";

export default function Upload() {
  const [uploaded, setUploaded] = useState([]);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl mb-6">Upload a file</h1>
      <UploadArea onUploaded={(file) => setUploaded((prev) => [file, ...prev])} />

      {uploaded.length > 0 && (
        <div className="mt-10">
          <h2 className="font-medium text-sm mb-3 pb-2 border-b border-line">Uploaded just now</h2>
          <ul>
            {uploaded.map((f) => (
              <li key={f.id} className="flex justify-between items-center text-sm py-2.5 border-b border-line last:border-0">
                <span>{f.file_name}</span>
                <span className="text-muted">{f.file_type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
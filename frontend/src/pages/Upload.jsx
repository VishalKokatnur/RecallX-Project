
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadArea from "../components/UploadArea.jsx";
import driveService from "../services/driveService.js";

export default function Upload() {
  const [uploaded, setUploaded] = useState([]);
  const [driveConnected, setDriveConnected] = useState(null); // null = still checking
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    driveService
      .getStatus()
      .then((data) => setDriveConnected(Boolean(data.connected)))
      .catch(() => setDriveConnected(false));
  }, []);

  const showBanner = driveConnected === false && !bannerDismissed;

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl mb-6">Upload a file</h1>

      {showBanner && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start justify-between gap-4">
          <p>
            Want your files safe and always available? Connect your Google
            Drive to RecallX and get{" "}
            <strong>15GB of free storage</strong> at no extra cost — your
            files stay backed up even if something goes wrong on our end.{" "}
            <Link to="/profile" className="underline font-medium">
              Connect Google Drive
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss"
            className="text-amber-700 hover:text-amber-900 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

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
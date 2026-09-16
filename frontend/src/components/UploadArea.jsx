import { useState, useRef } from "react";
import fileService from "../services/fileService.js";

export default function UploadArea({ onUploaded }) {
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    setError("");
    setProgress(0);
    try {
      const uploaded = await fileService.uploadFile(file, setProgress);
      onUploaded?.(uploaded);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || data?.error || "Upload failed");
    } finally {
      setProgress(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleBrowse = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
          ${dragActive ? "border-accent bg-accentSoft/40" : "border-line hover:border-ink"}`}
      >
        <p className="text-ink">Drag &amp; drop a file here, or click to browse</p>
        <p className="text-xs text-muted mt-1">JPG, PNG, PDF, TXT, DOCX, WAV</p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.txt,.docx,.wav"
          onChange={handleBrowse}
          className="hidden"
        />
      </div>

      {progress !== null && (
        <div className="mt-3">
          <div className="w-full bg-line rounded-full h-1.5">
            <div
              className="bg-accent h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-1">{progress}%</p>
        </div>
      )}

      {error && <p className="text-danger text-sm mt-3">{error}</p>}
    </div>
  );
}
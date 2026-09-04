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
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition
          ${dragActive ? "border-black bg-gray-50" : "border-gray-300"}`}
      >
        <p className="text-gray-600">Drag & drop a file here, or click to browse</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF, TXT, DOCX, WAV</p>        
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
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}%</p>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
    </div>
  );
}
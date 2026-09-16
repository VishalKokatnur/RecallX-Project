import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import driveService from "../services/driveService.js";

function loadScriptOnce(src, id) {
  const existing = document.getElementById(id);
  if (existing?.dataset.loaded === "true") return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error(`Could not load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.id = id;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.body.appendChild(script);
  });
}

function loadPicker() {
  return new Promise((resolve, reject) => {
    window.gapi.load("picker", {
      callback: resolve,
      onerror: () => reject(new Error("Could not load Google Picker.")),
      timeout: 10_000,
      ontimeout: () => reject(new Error("Google Picker timed out while loading.")),
    });
  });
}

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState("");
  const [pickerReady, setPickerReady] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  // A web client ID begins with its Google Cloud project number.  Keep the
  // explicit environment variable available for deployments where needed.
  const googleAppId = import.meta.env.VITE_GOOGLE_APP_ID || googleClientId?.split("-")[0];

  useEffect(() => {
    driveService.getStatus().then((data) => setDriveConnected(data.connected)).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    if (params.get("drive") === "connected") {
      setDriveConnected(true);
    }

    if (!googleClientId || !googleApiKey) {
      setImportResult("Google Drive import is not configured. Add VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY to frontend/.env, then restart Vite.");
      return;
    }

    let cancelled = false;
    const preparePicker = async () => {
      try {
        await loadScriptOnce("https://accounts.google.com/gsi/client", "gis-script");
        await loadScriptOnce("https://apis.google.com/js/api.js", "gapi-script");
        await loadPicker();
        if (!cancelled) setPickerReady(true);
      } catch (err) {
        if (!cancelled) setImportResult("Google Drive could not be prepared. Check your Google API configuration and try again.");
      }
    };

    preparePicker();
    return () => {
      cancelled = true;
    };
  }, [googleApiKey, googleClientId]);

  const handleImportedFiles = async (files, accessToken, accessTokenScope) => {
    setImporting(true);
    setImportResult("");
    try {
      const result = await driveService.importFiles(files, accessToken, accessTokenScope);
      let msg = `Imported ${result.imported.length} file(s).`;
      if (result.errors.length > 0) {
        msg += ` ${result.errors.length} failed: ${result.errors.join(" ")}`;
      }
      setImportResult(msg);
    } catch (err) {
      setImportResult("Import failed, please try again.");
    } finally {
      setImporting(false);
    }
  };

  const openDrivePicker = () => {
    if (!pickerReady) {
      setImportResult("Still preparing Google Drive - try again in a moment.");
      return;
    }

    if (!window.google?.accounts?.oauth2 || !window.google?.picker) {
      setImportResult("Google Drive is not ready yet. Please try again.");
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly",
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          setImportResult(`Google authorization failed: ${tokenResponse.error}.`);
          return;
        }
        const view = new window.google.picker.DocsView().setIncludeFolders(true).setSelectFolderEnabled(true);
        const picker = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(tokenResponse.access_token)
          .setDeveloperKey(googleApiKey)
          .setAppId(googleAppId)
          .setCallback((data) => {
            if (data.action === window.google.picker.Action.PICKED) {
              const files = data.docs.map((d) => ({ id: d.id, name: d.name, mimeType: d.mimeType }));
              handleImportedFiles(files, tokenResponse.access_token, tokenResponse.scope);
            }
          })
          .build();
        picker.setVisible(true);
      },
      error_callback: (error) => {
        setImportResult(`Google authorization could not open: ${error.type || "unknown error"}.`);
      },
    });

    tokenClient.requestAccessToken();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password/", {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setMessage("Password changed successfully.");
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="border rounded-md p-4 mb-8">
        <p className="text-sm text-gray-500">Username</p>
        <p className="font-medium mb-3">{user?.username}</p>
        <p className="text-sm text-gray-500">Email</p>
        <p className="font-medium">{user?.email || "Not set"}</p>
      </div>

      <div className="border rounded-md p-4 mb-8">
        <p className="text-sm text-gray-500 mb-2">Google Drive</p>
        {driveConnected ? (
          <>
            <p className="text-sm text-green-600 mb-3">Connected - select files or a folder to import its supported contents, including subfolders.</p>
            <button onClick={openDrivePicker} disabled={importing} className="border rounded-md px-4 py-2 text-sm disabled:opacity-50">
              {importing ? "Importing..." : "Import existing files from Drive"}
            </button>
            <button onClick={() => driveService.connect()} className="ml-2 border rounded-md px-4 py-2 text-sm">
              Refresh Drive permissions
            </button>
            {importResult && <p className="text-xs text-gray-500 mt-2">{importResult}</p>}
          </>
        ) : (
          <button onClick={() => driveService.connect()} className="border rounded-md px-4 py-2 text-sm">
            Connect Google Drive
          </button>
        )}
      </div>

      <h2 className="text-lg font-medium mb-4">Change password</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          type="password"
          name="current_password"
          placeholder="Current password"
          value={form.current_password}
          onChange={handleChange}
          required
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="password"
          name="new_password"
          placeholder="New password"
          value={form.new_password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm new password"
          value={form.confirm_password}
          onChange={handleChange}
          required
          className="w-full border rounded-md px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-md py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Updating..." : "Change password"}
        </button>
      </form>
    </div>
  );
}

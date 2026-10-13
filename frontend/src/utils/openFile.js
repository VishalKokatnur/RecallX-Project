import api from "../services/api";

/**
 * Pulls a human-readable message out of a failed request. Because these calls use
 * responseType "blob", an error body from the server arrives as a Blob, so it has
 * to be read as text and parsed before we can show the backend's message.
 */
async function getErrorMessage(err, fallback) {
  if (!err?.response) {
    return "Could not reach the server. Please check your connection and try again.";
  }
  try {
    const data = err.response.data;
    if (data instanceof Blob) {
      const parsed = JSON.parse(await data.text());
      if (parsed?.detail) return parsed.detail;
    } else if (data?.detail) {
      return data.detail;
    }
  } catch (_) {
    // body wasn't JSON - fall through to the generic message
  }
  return fallback;
}

/**
 * Fetches a file through the authenticated /api/files/{id}/download/ endpoint
 * (a plain <a href> can't carry the JWT auth header, so this does the request
 * with axios - which attaches it automatically - then opens the result as a
 * blob URL in a new tab).
 */
export async function openFile(url) {
  try {
    const response = await api.get(url, { responseType: "blob" });
    const blobUrl = URL.createObjectURL(response.data);
    window.open(blobUrl, "_blank");
    // give the new tab time to load the blob before releasing it
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    alert(await getErrorMessage(err, "Could not open this file. It may no longer be available."));
  }
}

/**
 * Same as openFile, but forces a save-as download instead of opening a tab.
 */
export async function downloadFile(url, fileName) {
  try {
    const response = await api.get(url, { responseType: "blob" });
    const blobUrl = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    alert(await getErrorMessage(err, "Could not download this file. It may no longer be available."));
  }
}
import api from "../services/api";

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
    alert("Could not open this file. It may no longer be available.");
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
    alert("Could not download this file. It may no longer be available.");
  }
}
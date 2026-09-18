import { useEffect, useState } from "react";
import api from "../services/api";

/**
 * <img> replacement for authenticated file URLs. A plain <img src> can't
 * carry the JWT auth header, so this fetches the image data through axios
 * (which attaches it automatically) and renders it as a blob URL instead.
 */
export default function AuthImage({ src, alt, className }) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;
    api
      .get(src, { responseType: "blob" })
      .then((response) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setBlobUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!blobUrl) {
    return <div className={`${className} bg-gray-100 animate-pulse`} />;
  }
  return <img src={blobUrl} alt={alt} className={className} />;
}
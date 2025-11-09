// src/utils/media.js
export const toImg = (path) => {
  if (!path) return "";
  const clean = String(path).trim().replace(/^\/+/, ""); // bỏ / đầu nếu có
  return clean.startsWith("http") ? clean : `http://127.0.0.1:5000/${clean}`;
};

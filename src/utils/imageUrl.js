const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Resolves any image path to a full URL.
 * - Full URLs (https://...) → returned as-is (Cloudinary etc.)
 * - Local /uploads/... paths → prefixed with API_BASE (legacy local dev)
 * - Empty/null → returns null
 */
export function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/uploads')) return `${API_BASE}${img}`;
  return img;
}

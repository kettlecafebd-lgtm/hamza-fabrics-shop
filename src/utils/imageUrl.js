import { appConfig } from '../config/app.js';

const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;
const INLINE_IMAGE_PATTERN = /^(?:blob:|data:image\/)/i;
const LEGACY_API_PATH_PATTERN = /^\/?(?:uploads|api)\//i;

const trimTrailingSlashes = (value) => value.replace(/\/+$/, '');
const trimLeadingSlashes = (value) => value.replace(/^\/+/, '');

/**
 * Convert the image values returned by the API into URLs a browser can load.
 *
 * The preferred API contract is a complete public URL. During the R2 migration,
 * product records may still contain an object key (for example,
 * "products/cotton/blue.webp"). Configure VITE_R2_PUBLIC_URL to map those keys
 * to the bucket's public custom domain.
 */
export function resolveImageUrl(value, {
  apiBaseUrl = appConfig.apiUrl,
  r2PublicUrl = appConfig.r2PublicUrl,
} = {}) {
  if (typeof value !== 'string') return '';

  const imagePath = value.trim();
  if (!imagePath) return '';

  // Keep complete remote URLs, protocol-relative URLs, and local previews intact.
  if (ABSOLUTE_URL_PATTERN.test(imagePath) || INLINE_IMAGE_PATTERN.test(imagePath)) {
    return imagePath;
  }

  // Legacy uploads were served by the API, not by the R2 public domain.
  if (LEGACY_API_PATH_PATTERN.test(imagePath)) {
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return apiBaseUrl ? `${trimTrailingSlashes(apiBaseUrl)}${path}` : path;
  }

  // A non-URL value is an R2 object key. Keep this path centralised so every
  // screen (product card, gallery, cart, checkout, order history) agrees.
  if (r2PublicUrl) {
    return `${trimTrailingSlashes(r2PublicUrl)}/${trimLeadingSlashes(imagePath)}`;
  }

  // Preserve backward compatibility while old records are migrated. This makes
  // the failure mode an API request rather than an accidental SPA route.
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return apiBaseUrl ? `${trimTrailingSlashes(apiBaseUrl)}${path}` : path;
}

export default resolveImageUrl;

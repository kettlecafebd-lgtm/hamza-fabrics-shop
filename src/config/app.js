const env = import.meta.env ?? {};
const normalizeBaseUrl = (value) => value?.trim().replace(/\/+$/, '') || '';

const configuredApiUrl = normalizeBaseUrl(env.VITE_API_URL);
const configuredR2PublicUrl = normalizeBaseUrl(env.VITE_R2_PUBLIC_URL);
const fallbackApiUrl = env.DEV
  ? 'http://localhost:5000'
  : globalThis.location?.origin || '';
const apiUrl = configuredApiUrl || fallbackApiUrl;

console.info(
  `[app-config] API URL: ${apiUrl || '(empty)'} (${configuredApiUrl ? 'VITE_API_URL' : 'fallback'}); R2 public URL: ${configuredR2PublicUrl || '(not configured)'}`,
);

export const appConfig = {
  apiUrl,
  r2PublicUrl: configuredR2PublicUrl,
  gtmId: env.VITE_GTM_CONTAINER_ID || '',
  siteName: env.VITE_SITE_NAME || 'Hamza Fabrics',
  siteDescription: env.VITE_SITE_DESCRIPTION || 'Premium Unstitched Fabrics',
  contactEmail: env.VITE_CONTACT_EMAIL || 'contact@hamzafabrics.com',
  contactPhone: env.VITE_CONTACT_PHONE || '+8801700000000',
  address: env.VITE_ADDRESS || 'Dhaka, Bangladesh',
  currency: env.VITE_CURRENCY || 'BDT',
  deliveryInside: Number(env.VITE_DELIVERY_INSIDE) || 80,
  deliveryOutside: Number(env.VITE_DELIVERY_OUTSIDE) || 150,
  freeDeliveryMin: Number(env.VITE_FREE_DELIVERY_MIN) || 3,
};

export default appConfig;

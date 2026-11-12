const URL_KEYS = [
  'cdn_url', 'cdnUrl', 'external_url', 'externalUrl', 'direct_url', 'directUrl',
  'media_url', 'mediaUrl', 'attachment_url', 'attachmentUrl', 'file_url', 'fileUrl',
  'image_url', 'imageUrl', 'video_url', 'videoUrl', 'audio_url', 'audioUrl',
  'refreshed_url', 'refreshedUrl', 'download_url', 'downloadUrl', 'url', 'src',
];

function usableUrl(value) {
  if (typeof value !== 'string') return '';
  const url = value.trim();
  // Chat media is served from external/CDN URLs. Never turn embedded data or
  // object URLs into a media source (nor rebuild a legacy API proxy URL).
  if (!url || /^(?:data:|blob:)/i.test(url) || /\/api\/chat\/media\//i.test(url)) return '';
  return url;
}

function findUrl(value, preferredIndex = 0) {
  if (typeof value === 'string') return usableUrl(value);
  if (Array.isArray(value)) {
    return findUrl(value[preferredIndex] ?? value[0], 0);
  }
  if (!value || typeof value !== 'object') return '';

  for (const key of URL_KEYS) {
    const url = usableUrl(value[key]);
    if (url) return url;
  }

  // Messenger Graph payloads often nest URLs inside these properties.
  for (const key of ['image_data', 'video_data', 'audio_data', 'image', 'video', 'audio', 'payload', 'media', 'attachments', 'data']) {
    const url = findUrl(value[key], preferredIndex);
    if (url) return url;
  }
  return '';
}

function inferMediaType(attachment, url) {
  const type = String(
    attachment?.mime_type ?? attachment?.mimeType ?? attachment?.media_type ??
    attachment?.mediaType ?? attachment?.type ?? '',
  ).toLowerCase();
  if (type.includes('image') || type === 'photo' || type === 'sticker') return 'image';
  if (type.includes('video')) return 'video';
  if (type.includes('audio') || type === 'voice' || type === 'voice_message') return 'audio';

  const path = String(url).split(/[?#]/, 1)[0].toLowerCase();
  if (/\.(?:png|jpe?g|gif|webp|avif|bmp|svg)$/.test(path)) return 'image';
  if (/\.(?:mp4|webm|mov|m4v|ogv)$/.test(path)) return 'video';
  if (/\.(?:mp3|m4a|aac|wav|ogg|opus|flac)$/.test(path)) return 'audio';
  return 'file';
}

export function getChatMessageAttachments(message) {
  if (!message || typeof message !== 'object') return [];

  const raw = message.attachments ?? message.media ?? message.media_urls ?? message.mediaUrls ??
    message.attachment ?? message.media_url ?? message.mediaUrl ?? message.attachment_url ?? message.attachmentUrl;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values.map((item) => {
    if (typeof item === 'string') return { url: usableUrl(item), type: inferMediaType({}, item) };
    const url = findUrl(item);
    return { ...item, url, type: inferMediaType(item, url) };
  }).filter((item) => item.url);
}

export function refreshedUrl(payload, attachmentIndex) {
  const body = payload?.data ?? payload;
  if (typeof body === 'string') return usableUrl(body);

  const list = body?.attachments ?? body?.media ?? body?.urls;
  if (Array.isArray(list)) {
    const indexed = findUrl(list[attachmentIndex] ?? list[0]);
    if (indexed) return indexed;
  }
  return findUrl(body, attachmentIndex);
}

export { inferMediaType };

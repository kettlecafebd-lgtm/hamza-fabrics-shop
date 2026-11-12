import { useRef, useState } from 'react';
import API_BASE_URL from '../../config/api';
import { inferMediaType, refreshedUrl } from './chatMediaUtils';

export default function ChatMedia({ messageId, attachment, attachmentIndex = 0, isDark = false }) {
  const originalUrl = attachment?.url || '';
  const [src, setSrc] = useState(originalUrl);
  const refreshAttempted = useRef(false);

  const refreshOnce = async () => {
    if (refreshAttempted.current || !messageId) return;
    refreshAttempted.current = true;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/chat/refresh-media/${encodeURIComponent(messageId)}`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) return;
      const payload = await response.json();
      const nextUrl = refreshedUrl(payload, attachmentIndex);
      if (nextUrl && nextUrl !== src) setSrc(nextUrl);
    } catch (error) {
      console.error('Unable to refresh chat attachment', error);
    }
  };

  const mediaProps = {
    src,
    onError: refreshOnce,
    referrerPolicy: 'no-referrer',
    className: 'max-h-80 max-w-full rounded-lg object-contain',
  };
  const type = attachment?.type || inferMediaType(attachment, src);

  if (type === 'image') {
    return <img {...mediaProps} alt={attachment?.name || 'Chat attachment'} loading="lazy" />;
  }
  if (type === 'video') {
    return <video {...mediaProps} controls preload="none" loading="lazy" />;
  }
  if (type === 'audio') {
    return <audio {...mediaProps} controls preload="none" className="max-w-full" />;
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className={`text-xs underline underline-offset-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}
    >
      {attachment?.name || 'Open attachment'}
    </a>
  );
}

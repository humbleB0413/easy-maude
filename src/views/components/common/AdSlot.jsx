/**
 * @file AdSlot.jsx
 * @description
 *   Google AdSense slot wrapper.
 *   - Development: always renders a labelled grey placeholder so layout impact is visible.
 *   - Production + configured (CLIENT & slot filled): pushes to adsbygoogle on mount.
 *   - Production + not yet configured: renders null (no space taken).
 *
 *   The AdSense global script must be present in index.html for real ads to load.
 */

import { useEffect } from 'react';
import { ADSENSE } from '../../../constants/config.js';

/**
 * @param {{ slot: string, style?: object }} props
 * @returns {JSX.Element|null}
 */
export default function AdSlot({ slot, style = {} }) {
  const isConfigured = Boolean(ADSENSE.CLIENT && slot);

  useEffect(() => {
    if (!isConfigured) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [isConfigured]);

  if (import.meta.env.DEV) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: 90,
          background: 'var(--color-border)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-muted)',
          fontSize: 'var(--font-size-sm)',
          letterSpacing: '0.05em',
          ...style,
        }}
      >
        Ad
      </div>
    );
  }

  if (!isConfigured) return null;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE.CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

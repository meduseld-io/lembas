import { useState } from 'react';
import { Monitor, X } from 'lucide-react';
import './DesktopBanner.css';

const DISMISSED_KEY = 'lembas_desktop_banner_dismissed';

export default function DesktopBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem(DISMISSED_KEY) === '1';
  });

  function handleDismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="desktop-banner" role="alert">
      <Monitor size={16} className="desktop-banner-icon" />
      <span>Lembas is designed for mobile. Some features may not work as expected on desktop.</span>
      <button className="desktop-banner-close" onClick={handleDismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

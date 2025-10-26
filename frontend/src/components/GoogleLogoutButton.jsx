import React from 'react';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      return resolve();
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.body.appendChild(script);
  });
}

const GoogleLogoutButton = ({ onLoggedOut, className = '' }) => {
  const handleLogout = async () => {
    try {
      // Clear app session
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('collectorId');
      localStorage.removeItem('customerId');

      // Best-effort: disable auto select to avoid silent login
      await loadGoogleScript();
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();

        // Optional revoke by email if stored
        const email = localStorage.getItem('userEmail');
        if (email) {
          window.google.accounts.id.revoke(email, () => {
            // revoked
          });
          localStorage.removeItem('userEmail');
        }
      }

      if (typeof onLoggedOut === 'function') onLoggedOut();
    } catch (e) {
      if (typeof onLoggedOut === 'function') onLoggedOut();
    }
  };

  return (
    <button type="button" onClick={handleLogout} className={className || "px-4 py-2 bg-gray-200 rounded"}>
      Logout
    </button>
  );
};

export default GoogleLogoutButton;



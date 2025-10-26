import React, { useEffect, useRef } from 'react';
import axios from 'axios';

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

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadGoogleScript();
        if (cancelled) return;
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.error('Missing REACT_APP_GOOGLE_CLIENT_ID');
          return;
        }
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const { data } = await axios.post('/user/login-google', { idToken: response.credential });
              if (data?.token) {
                localStorage.setItem('token', data.token);
                if (typeof onSuccess === 'function') onSuccess(data);
              } else if (typeof onError === 'function') {
                onError(new Error('No token in response'));
              }
            } catch (e) {
              if (typeof onError === 'function') onError(e);
              else console.error(e);
            }
          },
        });
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'signin_with',
            logo_alignment: 'left',
          });
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onSuccess, onError]);

  return (
    <div className="flex justify-center mt-4">
      <div ref={buttonRef} />
    </div>
  );
};

export default GoogleLoginButton;



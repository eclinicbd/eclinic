import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register PWA Service Worker for PWABuilder & offline support
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Service worker registered successfully
      })
      .catch((err) => {
        console.warn('PWA service worker registration notice:', err);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
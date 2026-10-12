import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// Register PWA Service Worker in production only so dev iframe preview never gets intercepted/cached
if (import.meta.env.PROD && 'serviceWorker' in navigator && typeof window !== 'undefined') {
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
} else if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  // If a previous service worker was active during dev in iframe, safely unregister it
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
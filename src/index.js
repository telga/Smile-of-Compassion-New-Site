import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import { getAssetPath } from './assetUtils';

// Dynamically create and add favicon to the document
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = getAssetPath('/assets/favicon.png');
document.head.appendChild(favicon);
// Add error handling for root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
} else {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
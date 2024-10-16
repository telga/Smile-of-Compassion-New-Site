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

// Log favicon information for debugging purposes
console.log('Favicon href:', favicon.href);
console.log('Favicon element:', favicon);

// Create a root for React 18's concurrent mode
const root = createRoot(document.getElementById('root'));

// Render the App component wrapped in StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
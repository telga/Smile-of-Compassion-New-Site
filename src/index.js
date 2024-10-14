import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = '/assets/favicon.png';
document.head.appendChild(favicon);

console.log('Favicon href:', favicon.href);
console.log('Favicon element:', favicon);

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';
import './styles/landing.css';
import './styles/cinematic-shell.css';
import './styles/red-system.css';
import './styles/red-field.css';
import './styles/red-only-purge.css';
import './styles/awwwards-atmosphere.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

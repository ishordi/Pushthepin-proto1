import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { log } from './lib/log';
import { mountGrain } from './styles/grain';
import { applyPrefsFromState } from './lib/prefs';
import { applyOverrides } from './lib/overrides';

mountGrain();
applyPrefsFromState();
applyOverrides();
log('app_open');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

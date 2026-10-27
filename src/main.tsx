import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// HashRouter: يعمل على أي استضافة ثابتة (GitHub Pages…) وتبقى الروابط العميقة والتحديث وزر الرجوع سليمة
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);

import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/tailwind.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  // StrictMode rimosso: causava doppio mount → AbortError sulle fetch Supabase
  root.render(<App />);
}
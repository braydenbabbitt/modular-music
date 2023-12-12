import { createRoot } from 'react-dom/client';
import { Routes } from './routes';

const container = document.getElementById('root');
createRoot(container!).render(<Routes />);

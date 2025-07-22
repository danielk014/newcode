import { createRoot } from 'react-dom/client'
import AppWithErrorBoundary from './AppWithErrorBoundary.tsx'
import './index.css'

console.log('Main.tsx is loading...');
const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (rootElement) {
  createRoot(rootElement).render(<AppWithErrorBoundary />);
  console.log('App rendered successfully');
} else {
  console.error('Root element not found!');
}

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import TestApp from './TestApp.tsx'
import './index.css'

console.log('Main.tsx is loading...');
const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (rootElement) {
  try {
    // Temporarily render TestApp to verify React is working
    createRoot(rootElement).render(<TestApp />);
    console.log('TestApp rendered successfully');
    
    // If test passes, uncomment this to use real app:
    // createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = '<div style="color: white; padding: 20px;">Error loading application. Check console.</div>';
  }
} else {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="color: white; padding: 20px;">Root element not found!</div>';
}

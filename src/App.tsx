import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import TacticsLibrary from './pages/TacticsLibrary';
import SavedScripts from './pages/SavedScripts';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tactics" element={<TacticsLibrary />} />
        <Route path="/saved" element={<SavedScripts />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;

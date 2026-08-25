import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, createContext, useContext } from 'react';
import { ToastProvider } from './useToast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import FlaggedReview from './pages/FlaggedReview';
import Records from './pages/Records';
import ScanDuplicates from './pages/ScanDuplicates';
import Settings from './pages/Settings';

/* ── Theme Context ── */
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ── Minimal page transitions ── */
const pageVariants = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1,  y: 0, transition: { duration: 0.2 } },
  exit:     { opacity: 0,  y: -5, transition: { duration: 0.15 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ height: '100%' }}
      >
        <Routes location={location}>
          <Route path="/"        element={<Dashboard />}    />
          <Route path="/add"     element={<AddEntry />}     />
          <Route path="/flagged" element={<FlaggedReview />}/>
          <Route path="/records" element={<Records />}      />
          <Route path="/scan"    element={<ScanDuplicates />}/>
          <Route path="/settings" element={<Settings />}    />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          {/* ── App Shell ── */}
          <div style={{
            display: 'flex', height: '100vh',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-primary)',
            overflow: 'hidden',
          }}>
            <Sidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
              <Topbar />
              <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', overflowY: 'auto' }}>
                  <AnimatedRoutes />
                </div>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

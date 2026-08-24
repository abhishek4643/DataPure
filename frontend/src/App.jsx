import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './useToast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import FlaggedReview from './pages/FlaggedReview';
import Records from './pages/Records';
import ScanDuplicates from './pages/ScanDuplicates';

/* Page transition wrapper */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ height: '100%' }}
      >
        <Routes location={location}>
          <Route path="/"        element={<Dashboard />}    />
          <Route path="/add"     element={<AddEntry />}     />
          <Route path="/flagged" element={<FlaggedReview />}/>
          <Route path="/records" element={<Records />}      />
          <Route path="/scan"    element={<ScanDuplicates />}/>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        {/* Ambient Video Background */}
        <div className="bg-canvas" aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#05080f' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              transform: 'translate(-50%, -50%)',
              opacity: 0.15,
              filter: 'hue-rotate(20deg) saturate(1.2)'
            }}
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-background-with-floating-particles-35031-large.mp4" type="video/mp4" />
          </video>
          {/* Overlay to ensure text readability */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, rgba(5,8,15,0.8) 100%)' }} />
        </div>

        {/* App shell */}
        <div style={{
          display: 'flex',
          height: '100vh',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}>
          <Sidebar />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <Topbar />

            <main
              style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
              /* Extra bottom padding for mobile bottom nav */
              className="md:pb-0"
            >
              <div style={{ height: '100%', overflowY: 'auto' }}>
                <AnimatedRoutes />
              </div>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

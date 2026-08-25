import { Search, User, Moon, Sun, Settings, LogOut, CreditCard, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../App';
import { useToast } from '../useToast';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getEntries } from '../api';

const PAGE_TITLES = {
  '/': 'Overview',
  '/add': 'Add Entry',
  '/flagged': 'Review Queue',
  '/records': 'Cloud Records',
  '/scan': 'Duplicate Scanner',
};

export default function Topbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const title = PAGE_TITLES[loc.pathname] || 'DataPure';
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchFocus = async () => {
    setSearchFocused(true);
    try {
      const res = await getEntries({ limit: 1000 });
      const entries = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.entries || []);
      setAllRecords(entries);
    } catch (e) {
      console.error("Failed to load records for search", e);
    }
  };

  const searchResults = searchQuery.trim() 
    ? allRecords.filter(r => 
        (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (r.email && r.email.toLowerCase().includes(searchQuery.toLowerCase()))
      ) 
    : [];

  return (
    <div style={{
      height: 64, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px',
      position: 'relative',
      zIndex: 50
    }}>
      {/* Page Title */}
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative' }} ref={searchRef}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search database..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              padding: '8px 16px 8px 36px',
              fontSize: 14,
              color: 'var(--text-primary)',
              outline: 'none',
              width: searchFocused ? 300 : 220,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => { if(!searchFocused) e.target.style.borderColor = 'var(--text-tertiary)'; }}
            onMouseLeave={e => { if(!searchFocused) e.target.style.borderColor = 'var(--border-color)'; }}
          />

          <AnimatePresence>
            {searchFocused && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                  borderRadius: 12, boxShadow: 'var(--shadow-lg)',
                  maxHeight: 320, overflowY: 'auto', zIndex: 100
                }}
              >
                {searchResults.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Search size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <div style={{ fontSize: 13 }}>No results found for "{searchQuery}"</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Records ({searchResults.length})
                    </div>
                    {searchResults.map(record => (
                      <div key={record.id} style={{ 
                        padding: '10px 12px', borderBottom: '1px solid var(--border-color)',
                        display: 'flex', flexDirection: 'column', gap: 4,
                        cursor: 'pointer', transition: 'background 0.1s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => {
                        setSearchFocused(false);
                        setSearchQuery('');
                        navigate('/records');
                      }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{record.name || 'Unknown'}</span>
                          {record.status === 'valid' && <CheckCircle2 size={14} color="var(--color-success)" />}
                          {record.status === 'flagged' && <AlertTriangle size={14} color="var(--color-warning)" />}
                          {record.status === 'duplicate' && <Info size={14} color="var(--color-danger)" />}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {record.email} {record.phone ? `• ${record.phone}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div style={{ display: 'flex', gap: 8, color: 'var(--text-secondary)' }}>
          <button className="btn-icon" onClick={toggleTheme} style={{ borderRadius: '50%' }} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button 
              className="btn-icon" 
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ 
                borderRadius: '50%', 
                background: profileOpen ? 'var(--bg-surface-hover)' : 'var(--color-primary-light)',
                color: profileOpen ? 'var(--text-primary)' : 'var(--color-primary)',
                border: profileOpen ? '1px solid var(--color-primary)' : '1px solid transparent'
              }} 
            >
              <User size={16} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 8,
                    width: 200,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-lg)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: '8px 10px', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Admin User</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>admin@datapure.io</div>
                  </div>
                  
                  <div style={{ height: 1, background: 'var(--border-color)', margin: '0 4px 4px' }} />
                  
                  <button 
                    className="dropdown-item" 
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  >
                    <User size={14} /> My Profile
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  >
                    <Settings size={14} /> Preferences
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

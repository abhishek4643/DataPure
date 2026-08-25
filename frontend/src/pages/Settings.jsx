import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings as SettingsIcon, Shield, Bell, Save, Key, RefreshCw } from 'lucide-react';
import { useToast } from '../useToast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { addToast } = useToast();

  // Profile State
  const [fullName, setFullName] = useState('Admin User');
  
  // Preferences State
  const [scanEngine, setScanEngine] = useState('Standard (Fuzzy Matching)');
  const [threshold, setThreshold] = useState(85);

  // Notifications State
  const [notifs, setNotifs] = useState([true, true, false]);

  const handleSave = () => {
    addToast('Settings saved successfully', 'success');
  };
  
  const handleGenerateKey = () => {
    addToast('New API Key generated', 'success');
  };

  const toggleNotif = (index) => {
    const newNotifs = [...notifs];
    newNotifs[index] = !newNotifs[index];
    setNotifs(newNotifs);
  };

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
  };

  const TabButton = ({ id, icon: Icon, label }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          width: '100%', padding: '10px 14px',
          borderRadius: 8, border: 'none',
          background: active ? 'var(--bg-surface-hover)' : 'transparent',
          color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
          fontWeight: active ? 600 : 500,
          cursor: 'pointer', transition: 'all 0.15s ease',
          fontSize: 14, textAlign: 'left'
        }}
      >
        <Icon size={18} style={{ color: active ? 'var(--color-primary)' : 'var(--text-tertiary)' }} />
        {label}
      </button>
    );
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Account Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal profile and system preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        
        {/* Settings Sidebar */}
        <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <TabButton id="profile" icon={User} label="My Profile" />
          <TabButton id="preferences" icon={SettingsIcon} label="Preferences" />
          <TabButton id="security" icon={Shield} label="Security" />
          <TabButton id="notifications" icon={Bell} label="Notifications" />
        </div>

        {/* Settings Content */}
        <div className="glass" style={{ flex: 1, padding: 32, minHeight: 400 }}>
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontSize: 18, marginBottom: 24 }}>Profile Information</h2>
                
                <div style={{ display: 'grid', gap: 20, maxWidth: 400 }}>
                  <div className="field">
                    <label className="field-label">Full Name</label>
                    <input 
                      type="text" className="field-input" style={{ paddingLeft: 14 }} 
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  
                  <div className="field">
                    <label className="field-label">Email Address</label>
                    <input type="email" className="field-input" style={{ paddingLeft: 14 }} value="admin@datapure.io" disabled />
                  </div>
                  
                  <div className="field">
                    <label className="field-label">Role</label>
                    <input type="text" className="field-input" style={{ paddingLeft: 14 }} value="Data Engineer" disabled />
                  </div>
                </div>

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={16} /> Save Profile
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div key="preferences" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontSize: 18, marginBottom: 24 }}>System Preferences</h2>
                
                <div style={{ display: 'grid', gap: 24, maxWidth: 500 }}>
                  <div>
                    <label className="field-label" style={{ fontSize: 14, color: 'var(--text-primary)' }}>Default Scan Engine</label>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Choose the algorithm used for background deduplication.</p>
                    <select 
                      className="field-input" style={{ paddingLeft: 14 }}
                      value={scanEngine} onChange={(e) => setScanEngine(e.target.value)}
                    >
                      <option>Standard (Fuzzy Matching)</option>
                      <option>Deep Scan (Machine Learning)</option>
                      <option>Exact Match Only (Fastest)</option>
                    </select>
                  </div>
                  
                  <div style={{ height: 1, background: 'var(--border-color)' }} />

                  <div>
                    <label className="field-label" style={{ fontSize: 14, color: 'var(--text-primary)' }}>Auto-Flag Threshold</label>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Similarity percentage required to automatically flag a record.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <input 
                        type="range" 
                        min="50" max="100" 
                        value={threshold} 
                        onChange={(e) => setThreshold(e.target.value)}
                        style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }} 
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, width: 40, color: 'var(--text-primary)' }}>{threshold}%</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={16} /> Save Preferences
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontSize: 18, marginBottom: 24 }}>Security & API Access</h2>
                
                <div style={{ display: 'grid', gap: 24, maxWidth: 500 }}>
                  <div>
                    <label className="field-label" style={{ fontSize: 14, color: 'var(--text-primary)' }}>Password</label>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Last changed 45 days ago.</p>
                    <button className="btn btn-ghost" onClick={() => addToast('Password reset link sent to email', 'success')}>
                      Update Password
                    </button>
                  </div>

                  <div style={{ height: 1, background: 'var(--border-color)' }} />

                  <div>
                    <label className="field-label" style={{ fontSize: 14, color: 'var(--text-primary)' }}>Active API Key</label>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Use this key to authenticate external API requests to DataPure.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="field" style={{ flex: 1 }}>
                        <Key size={16} className="field-icon" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="password" value="dp_live_8f7d6a5b4c3d2e1f" readOnly className="field-input" style={{ height: 38 }} />
                      </div>
                      <button className="btn btn-ghost" onClick={handleGenerateKey} title="Rotate Key">
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifications" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontSize: 18, marginBottom: 24 }}>Notification Routing</h2>
                
                <div style={{ display: 'grid', gap: 20, maxWidth: 500 }}>
                  {[
                    { title: 'Weekly Digest', desc: 'Receive a summary of data health and duplicates cleaned.' },
                    { title: 'Scan Failures', desc: 'Immediate alerts if a background deduplication scan fails.' },
                    { title: 'Review Queue Threshold', desc: 'Notify me when flagged records exceed 50 items.' }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.desc}</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifs[i]} 
                        onChange={() => toggleNotif(i)}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary)' }} 
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={16} /> Save Notification Settings
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

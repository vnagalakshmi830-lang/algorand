import React, { useState } from 'react';
import './Settings.css';

const Settings = ({ accountAddress, profileData, handleConnect, handleDisconnect }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);

  // Hardcoded values mimicking what external databases would provide for gaps in Web3 context
  const mockDob = "Not Provided";
  const mockCreated = "Apr 2024";

  const [profileForm, setProfileForm] = useState({
    displayName: profileData?.user?.name || "Guest Learner",
    email: profileData?.user?.email || "Not Provided",
    dob: mockDob,
    primaryWallet: accountAddress ? `${accountAddress.slice(0,8)}...${accountAddress.slice(-6)}` : '',
    accountCreated: mockCreated,
    lastActive: profileData?.activity?.lastActive || "Unknown"
  });

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = () => {
    setIsProfileEditing(false);
    // Implement API endpoint communication for save when backend exists
    alert("Profile settings saved successfully!");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Wallet Address Copied to Clipboard!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section fade-in">
            <h3>User Profile</h3>
            <p className="settings-desc">Manage your core account identity securely.</p>
            
            <div className="settings-grid">
              <div className="set-card">
                <label>Display Name</label>
                {isProfileEditing ? (
                  <input type="text" value={profileForm.displayName} onChange={(e) => handleProfileChange('displayName', e.target.value)} />
                ) : (
                  <div className="val">{profileForm.displayName}</div>
                )}
              </div>
              <div className="set-card">
                <label>Email Address</label>
                {isProfileEditing ? (
                  <input type="email" value={profileForm.email} onChange={(e) => handleProfileChange('email', e.target.value)} />
                ) : (
                  <div className="val">{profileForm.email}</div>
                )}
              </div>
              <div className="set-card">
                <label>Date of Birth</label>
                {isProfileEditing ? (
                  <input type="text" value={profileForm.dob} onChange={(e) => handleProfileChange('dob', e.target.value)} className="text-muted" />
                ) : (
                  <div className="val text-muted">{profileForm.dob}</div>
                )}
              </div>
              <div className="set-card">
                <label>Primary Wallet</label>
                {isProfileEditing ? (
                  <input type="text" value={profileForm.primaryWallet} onChange={(e) => handleProfileChange('primaryWallet', e.target.value)} />
                ) : (
                  <div className="val">{profileForm.primaryWallet}</div>
                )}
              </div>
              <div className="set-card">
                <label>Account Created</label>
                <div className="val text-muted">{profileForm.accountCreated}</div>
              </div>
              <div className="set-card">
                <label>Last Active</label>
                <div className="val">{profileForm.lastActive}</div>
              </div>
            </div>

            {isProfileEditing ? (
              <button 
                className="profile-fab"
                onClick={saveProfile}
                style={{ width: 'auto', padding: '0 2rem', borderRadius: '30px', backgroundColor: '#9333ea', cursor: 'pointer', pointerEvents: 'auto' }}
                title="Save Changes"
              >
                Confirm
              </button>
            ) : (
              <button 
                className="profile-fab"
                onClick={() => setIsProfileEditing(true)}
                style={{ width: 'auto', padding: '0 2rem', borderRadius: '30px', backgroundColor: '#9333ea', cursor: 'pointer', pointerEvents: 'auto' }}
                title="Edit Profile"
              >
                Edit
              </button>
            )}
          </div>
        );
      case 'wallet':
        return (
          <div className="settings-section fade-in">
            <h3>Wallet Settings</h3>
            <p className="settings-desc">Control your Algorand digital asset connectivity.</p>
            
            <div className="wallet-ops-card">
               <div className="wo-header">
                 <div className="wo-status">
                   <div className={`status-dot ${accountAddress ? 'green' : 'red'}`}></div>
                   <span>{accountAddress ? 'Live Testnet Connection' : 'Disconnected'}</span>
                 </div>
                  {accountAddress ? (
                    <button 
                      className="btn-danger-outline" 
                      onClick={handleDisconnect}
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      className="btn-primary" 
                      onClick={handleConnect}
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    >
                      Connect Wallet
                    </button>
                  )}
               </div>
               
               {accountAddress && (
                 <div className="wo-details">
                    <div className="wo-row">
                      <span>Connected Address</span>
                      <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                        <strong>{accountAddress.slice(0,6)}...{accountAddress.slice(-4)}</strong>
                        <button className="icon-btn-small" onClick={() => copyToClipboard(accountAddress)}>📋</button>
                      </div>
                    </div>
                    <div className="wo-row">
                      <span>Live Balance</span>
                      <strong style={{color:'var(--primary)', fontSize:'1.1rem'}}>{profileData?.wallet?.balance?.toFixed(2)} ALGO</strong>
                    </div>
                    <div className="wo-row">
                      <span>Network Identifier</span>
                      <span className="badge-gray">Algorand Testnet</span>
                    </div>
                    <div className="wo-row">
                      <span>Transaction Sync</span>
                      <span className="badge-green">Synchronized</span>
                    </div>
                    
                    <a 
                      href={`https://testnet.algoexplorer.io/address/${accountAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-secondary mt-1" 
                      style={{ display: 'inline-block', textAlign: 'center', pointerEvents: 'auto', cursor: 'pointer', textDecoration: 'none' }}
                    >
                      View on AlgoExplorer ↗
                    </a>
                 </div>
               )}
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="settings-section fade-in">
            <h3>Hardened Security</h3>
            <p className="settings-desc">Protect your FinChain environment and mitigate external threats.</p>
            
            <div className="security-ops">
              <div className="sec-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 100%' }}>
                  <h4>Change Password</h4>
                  <p style={{ marginBottom: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Update your application login password to maintain account integrity.</p>
                  <input 
                    type="password" 
                    placeholder="Enter New Password"
                    style={{
                       width: '100%',
                       padding: '0.6rem 1rem',
                       border: '1px solid var(--border-color)',
                       borderRadius: '8px',
                       outline: 'none',
                       fontFamily: 'inherit',
                       fontSize: '0.95rem',
                       pointerEvents: 'auto'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button 
                    className="btn-purple" 
                    onClick={() => alert('Password successfully updated.')}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    Confirm Update
                  </button>
                </div>
              </div>

              <div className="sec-row">
                <div>
                  <h4>Two-Factor Authentication (2FA)</h4>
                  <p>Add an extra layer of security requiring an authenticator app.</p>
                </div>
                <label className="toggle-switch" style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={is2FAEnabled}
                    onChange={(e) => setIs2FAEnabled(e.target.checked)}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="sec-row">
                <div>
                  <h4>Biometric Security</h4>
                  <p>Use WebAuthn for faster logins via fingerprint or facial recognition.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Enable FaceID / TouchID</span>
                  <label className="toggle-switch" style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isBiometricEnabled}
                      onChange={(e) => setIsBiometricEnabled(e.target.checked)}
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="sec-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 100%' }}>
                  <h4>Active Sessions</h4>
                  <p>Review and terminate active connections to your FinChain profile.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    <strong>iPhone 16 Pro Max</strong> - Chennai, India (Current)
                  </div>
                  <button 
                    className="btn-danger-outline" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', pointerEvents: 'auto', cursor: 'pointer' }}
                    onClick={() => alert("Session revoked.")}
                  >
                    Revoke
                  </button>
                </div>
              </div>

              <button 
                className="btn-emergency"
                onClick={() => alert("EMERGENCY PROTOCOL IMMINENT. Account frozen.")}
              >
                EMERGENCY: Freeze Account
              </button>

            </div>
            
            <button 
              className="profile-fab"
              onClick={() => alert('Security settings saved!')}
              style={{ width: '60px', padding: '0', borderRadius: '50%' }}
              title="Save Security Settings"
            >
              +
            </button>
          </div>
        );
      case 'help':
        return (
          <div className="settings-section fade-in" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <h3>FAQ / Help Center</h3>
            <p className="settings-desc">Interact with the FinChain AI assistant for rapid support.</p>
            <div className="chatbot-embed" style={{flex: 1, minHeight: '500px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '1rem'}}>
              <iframe 
                src="https://www.chatbase.co/chatbot-iframe/xET7zDcFlQnYOYkmPJAb1"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Support Chatbot"
              ></iframe>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container settings-page">
      <div className="settings-layout">
        
        {/* Left Sidebar Tabs */}
        <aside className="settings-sidebar card">
          <h2>Dashboard Settings</h2>
          <nav className="settings-nav">
            <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              👤 User Profile
            </button>
            <button className={`nav-tab ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
              👛 Wallet Settings
            </button>
            <button className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              🛡️ Security Settings
            </button>
            <button className={`nav-tab ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>
              💬 FAQ / Help
            </button>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="settings-content card">
          {renderContent()}
        </main>

      </div>
    </div>
  );
};

export default Settings;

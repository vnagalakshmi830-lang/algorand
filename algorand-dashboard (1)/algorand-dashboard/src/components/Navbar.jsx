import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFinChain } from '../context/FinChainContext';
import './Navbar.css';

const Navbar = ({ accountAddress, onConnect, onDisconnect, pageTitle, profileData }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { state } = useFinChain();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Handle outside click securely
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ensure the click isn't inside our specific dropdown hierarchy via refs
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => { setIsProfileOpen(!isProfileOpen); setIsNotificationOpen(false); };
  const toggleNotification = () => { setIsNotificationOpen(!isNotificationOpen); setIsProfileOpen(false); };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2);
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <h1 className="nav-page-title">{pageTitle}</h1>
        </div>
        
        <div className="nav-actions">
          <div className="nav-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search..." />
          </div>

          {!accountAddress && (
             <button className="btn-connect" onClick={onConnect}>
               Connect Wallet
             </button>
          )}

          <div className="nav-icons">
            <div className="notification-container" ref={notifRef} style={{ position: 'relative', zIndex: 1000 }}>
              <button 
                className="icon-btn notification-btn"
                onClick={toggleNotification}
                style={{ cursor: 'pointer' }}
              >
                <span className="icon">🔔</span>
                {state?.transactions?.length > 0 && <span className="badge"></span>}
              </button>

              {isNotificationOpen && (
                <div className="notification-dropdown guvi-style-dropdown">
                  <div className="dropdown-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '700' }}>Notifications</h4>
                  </div>
                  <div className="notification-list" style={{ maxHeight: '350px', overflowY: 'auto', padding: '0' }}>
                    {(!state?.transactions || state.transactions.length === 0) ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p style={{ margin: 0 }}>No recent notifications</p>
                      </div>
                    ) : (
                      state.transactions.slice(0, 10).map((tx, idx) => (
                        <div key={idx} className="notification-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                              {tx.type === 'received' ? 'Deposit' : tx.type === 'sent' ? 'Sent' : tx.type === 'withdrawal' ? 'Withdrawal' : 'Transaction'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                              {tx.time} • {tx.status || 'Completed'}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: tx.type === 'received' ? 'var(--success)' : 'var(--danger)', alignSelf: 'center' }}>
                            {tx.type === 'received' ? '+' : '-'}{tx.amount?.toFixed(2)} ALGO
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Native Profile Dropdown Wrapper */}
            <div className="profile-container" ref={dropdownRef} style={{ position: 'relative' }}>
              <button 
                className="icon-btn profile-btn" 
                onClick={toggleDropdown} 
                style={{ cursor: 'pointer', zIndex: 100 }}
              >
                <span className="icon" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {profileData?.user?.avatar ? (
                    <img src={profileData.user.avatar} alt="Profile" style={{width: '24px', height: '24px', borderRadius: '50%'}} />
                  ) : (
                    getInitials(profileData?.user?.name)
                  )}
                </span>
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown guvi-style-dropdown">
                  <div className="dropdown-header">
                    <div className="avatar-circle">{getInitials(profileData?.user?.name)}</div>
                    <div className="user-details">
                      <h4>{profileData?.user?.name || 'User'}</h4>
                      <p>{profileData?.user?.email}</p>
                    </div>
                  </div>

                  <div className="dropdown-section wallet-section">
                    {profileData?.wallet?.connected ? (
                      <div className="wallet-connected">
                        <div className="wallet-status"><span className="status-dot green"></span> Connected</div>
                        <div className="wallet-metrics">
                          <p className="wallet-address">{profileData.wallet.address.slice(0,5)}...{profileData.wallet.address.slice(-4)}</p>
                          <p className="wallet-balance">{profileData.wallet.balance.toFixed(2)} ALGO</p>
                        </div>
                      </div>
                    ) : (
                      <div className="wallet-disconnected">
                        <p>Wallet Not Connected</p>
                        <button className="glow-btn" onClick={onConnect}>Connect Wallet</button>
                      </div>
                    )}
                  </div>

                  <div className="dropdown-section activity-section">
                    <p className="section-title">FINANCIAL ACTIVITIES</p>
                    <ul className="activity-list">
                      <li><span>💰 Total Balance:</span> <strong>{profileData?.wallet?.balance?.toFixed(2) || 0} ALGO</strong></li>
                      <li><span>🔄 Transactons:</span> <strong>{profileData?.activity?.transactions || 0}</strong></li>
                      <li><span>📥 Deposits:</span> <strong>{profileData?.activity?.deposits || 0}</strong></li>
                      <li><span>📤 Withdrawals:</span> <strong>{profileData?.activity?.withdrawals || 0}</strong></li>
                      <li><span>🕒 Last Activity:</span> <strong>{profileData?.activity?.lastActive || 'N/A'}</strong></li>
                    </ul>

                    {profileData?.wallet?.connected && (
                      <div className="recent-tx-mini" style={{ marginTop: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
                        <p className="section-title" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>RECENT ACTIVITY</p>
                        {state?.transactions?.slice(0, 3).map((tx, idx) => (
                           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                             <div>
                               <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                 {tx.type === 'received' ? 'Deposit' : 'Withdrawal'}
                               </div>
                               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.time} • Completed</div>
                             </div>
                             <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: tx.type === 'received' ? 'var(--success)' : 'var(--danger)' }}>
                               {tx.type === 'received' ? '+' : '-'}{tx.amount.toFixed(2)} ALGO
                             </div>
                           </div>
                        ))}
                        {(!state?.transactions || state.transactions.length === 0) && (
                           <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No recent activity securely routed from chain.</div>
                        )}
                      </div>
                    )}
                  </div>                  <div className="dropdown-menu">
                    <button className="menu-item-btn" onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}>My Profile</button>
                    <button className="menu-item-btn" onClick={() => { navigate('/history'); setIsProfileOpen(false); }}>Transaction History</button>
                    <button className="menu-item-btn" onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}>Wallet Settings</button>
                    <button className="menu-item-btn" onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}>Security Settings</button>
                    <button className="menu-item-btn" onClick={() => { navigate('/help'); setIsProfileOpen(false); }}>FAQ / Help</button>
                    
                    {profileData?.wallet?.connected && (
                      <button className="menu-item-btn text-danger" onClick={() => { onDisconnect(); setIsProfileOpen(false); }}>
                        Disconnect Wallet
                      </button>
                    )}
                    <button className="menu-item-btn text-danger prompt-logout" onClick={() => { onDisconnect(); setIsProfileOpen(false); navigate('/login'); }}>Sign Out</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

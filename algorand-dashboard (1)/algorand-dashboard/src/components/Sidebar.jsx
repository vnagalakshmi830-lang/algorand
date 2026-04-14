import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ accountAddress, onConnect, onDisconnect }) => {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-shield"></div>
        <h2>FinChain</h2>
      </div>
      
      <div className="sidebar-sections-wrapper">
        <div className="nav-section">
          <p className="section-label">MAIN</p>
          <nav className="sidebar-nav">
            <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
              <span className="icon">㗊</span> Dashboard
            </NavLink>
            <NavLink to="/history" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <span className="icon">⇆</span> Transactions
            </NavLink>
            <NavLink to="/budgets" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <span className="icon">💰</span> Budgets
            </NavLink>
            <NavLink to="/forecast" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <span className="icon">📈</span> Forecast
            </NavLink>
            <NavLink to="/goals" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <span className="icon">🎯</span> Goals
            </NavLink>
            <NavLink to="/customers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <span className="icon">👥</span> Customers
            </NavLink>
          </nav>
        </div>

        <div className="nav-section">
          <p className="section-label">OTHER</p>
          <nav className="sidebar-nav">
            <NavLink to="/coupons" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <span className="icon">🏷️</span> Coupons
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <span className="icon">⚙️</span> Settings
            </NavLink>
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        {accountAddress ? (
          <div className="wallet-connected-sidebar" onClick={onDisconnect} title="Click to Disconnect">
            <div className="wallet-icon">👛</div>
            <div className="wallet-details">
              <span className="wallet-status">Connected</span>
              <span className="wallet-address">{formatAddress(accountAddress)}</span>
            </div>
          </div>
        ) : (
          <div className="wallet-connected-sidebar disconnected" onClick={onConnect} title="Click to Connect">
            <div className="wallet-icon">🔌</div>
            <div className="wallet-details">
              <span className="wallet-status">Not Connected</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

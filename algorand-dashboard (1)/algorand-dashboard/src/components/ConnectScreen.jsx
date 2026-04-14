import React from 'react';
import './ConnectScreen.css';

const ConnectScreen = ({ onConnect }) => {
  return (
    <div className="connect-screen">
      <div className="connect-overlay"></div>
      <div className="connect-content">
        <div className="logo-section">
          <div className="logo-shield-large"></div>
          <h1>FinChain</h1>
          <p className="tagline">The Future of AI-Driven Finance on Algorand</p>
        </div>
        
        <div className="glass-card connect-card">
          <h2>Secure Your Financial Future</h2>
          <p>Connect your Pera Wallet to access real-time on-chain analytics, AI cash flow predictions, and smart behavioral insights.</p>
          
          <div className="feature-badges">
            <div className="badge"><span className="badge-icon">📊</span> <span>Real-time Data</span></div>
            <div className="badge"><span className="badge-icon">🤖</span> <span>AI Predictions</span></div>
            <div className="badge"><span className="badge-icon">🛡️</span> <span>Secure Access</span></div>
          </div>
          
          <button className="primary-connect-btn" onClick={onConnect}>
            <span className="btn-icon">👛</span>
            Connect Pera Wallet
          </button>
          
          <p className="footer-note">Don't have a wallet? <a href="https://perawallet.app/" target="_blank" rel="noopener noreferrer">Download Pera Wallet</a></p>
        </div>
      </div>
    </div>
  );
};

export default ConnectScreen;

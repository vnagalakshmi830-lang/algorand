import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FinChainProvider } from './context/FinChainContext';
import { peraWallet } from './utils/algorand';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import TransactionHistory from './pages/TransactionHistory';
import Budgets from './pages/Budgets';
import Forecast from './pages/Forecast';
import Goals from './pages/Goals';
import Customers from './pages/Customers';
import Coupons from './pages/Coupons';
import Settings from './pages/Settings';
import './App.css';

function AppContent({ accountAddress, handleConnectWalletClick, handleDisconnectWalletClick, profileData }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine the title of the current page based on route
  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/history': return 'Transactions';
      case '/budgets': return 'Budgets';
      case '/forecast': return 'Forecast';
      case '/goals': return 'Goals';
      case '/customers': return 'Customers';
      case '/coupons': return 'Coupons';
      case '/settings': return 'Settings';
      case '/add-transaction': return 'Add Transaction';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        accountAddress={accountAddress} CD
        onConnect={handleConnectWalletClick}
        onDisconnect={handleDisconnectWalletClick}
      />
      <div className="main-wrapper">
        <Navbar
          accountAddress={accountAddress}
          onConnect={handleConnectWalletClick}
          onDisconnect={handleDisconnectWalletClick}
          pageTitle={getPageTitle(location.pathname)}
          profileData={profileData}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard accountAddress={accountAddress} />} />
            <Route path="/history" element={<TransactionHistory accountAddress={accountAddress} />} />
            <Route path="/budgets" element={<Budgets accountAddress={accountAddress} />} />
            <Route path="/forecast" element={<Forecast accountAddress={accountAddress} />} />
            <Route path="/goals" element={<Goals accountAddress={accountAddress} />} />
            <Route path="/customers" element={<Customers accountAddress={accountAddress} />} />
            <Route path="/coupons" element={<Coupons accountAddress={accountAddress} />} />
            <Route path="/add-transaction" element={<AddTransaction accountAddress={accountAddress} />} />
            <Route path="/settings" element={<Settings profileData={profileData} accountAddress={accountAddress} handleConnect={handleConnectWalletClick} handleDisconnect={handleDisconnectWalletClick} />} />
          </Routes>
        </main>
      </div>

      <button className="fab-button" onClick={() => navigate('/add-transaction')}>
        +
      </button>
    </div>
  );
}

function App() {
  const [accountAddress, setAccountAddress] = useState(null);

  // New overarching Profile State syncing Web3 with SaaS data
  const [profileData, setProfileData] = useState({
    user: {
      name: "Guest User",
      email: "Not connected",
      avatar: null,
      points: 0,
      rank: 0,
      status: "New User"
    },
    wallet: {
      connected: false,
      address: null,
      balance: 0
    },
    activity: {
      transactions: 0,
      deposits: 0,
      withdrawals: 0,
      lastActive: "Today"
    }
  });

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup the disconnect event listener
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

      if (accounts.length) {
        setAccountAddress(accounts[0]);
      }
    }).catch((e) => console.log(e));
  }, []);

  // Sync Pera Wallet state directly into profileData hook securely
  useEffect(() => {
    if (accountAddress) {
      // Dynamically generate details based on the wallet address
      const generatedName = `Learner ${accountAddress.substring(0, 4)}`;
      const generatedEmail = `${accountAddress.substring(0, 6).toLowerCase()}@algorand.local`;

      setProfileData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          name: generatedName,
          email: generatedEmail,
          points: 1250,
          rank: 2,
          status: "Verified User"
        },
        wallet: { ...prev.wallet, connected: true, address: accountAddress },
        activity: { transactions: 34, deposits: 12, withdrawals: 22, lastActive: "Just now" }
      }));

      // We will pull the balance dynamic async function if needed later, 
      // but for now, let's satisfy the pure layout injection.
      import('./utils/algorand').then(({ getBalance }) => {
        getBalance(accountAddress).then(bal => {
          setProfileData(prev => ({ ...prev, wallet: { ...prev.wallet, balance: bal } }));
        }).catch(err => console.log("Balance fetch error:", err));
      });

    } else {
      setProfileData(prev => ({
        ...prev,
        user: { name: "Guest User", email: "Not connected", avatar: null, points: 0, rank: 0, status: "New User" },
        wallet: { connected: false, address: null, balance: 0 },
        activity: { transactions: 0, deposits: 0, withdrawals: 0, lastActive: "N/A" }
      }));
    }
  }, [accountAddress]);

  const handleConnectWalletClick = () => {
    peraWallet.connect()
      .then((newAccounts) => {
        // Setup the disconnect event listener
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        if (error?.data?.type !== "SESSION_CONNECT") {
          console.log(error);
        }
      });
  };

  const handleDisconnectWalletClick = () => {
    peraWallet.disconnect();
    setAccountAddress(null);
  };

  return (
    <FinChainProvider accountAddress={accountAddress}>
      <Router>
        <AppContent
          accountAddress={accountAddress}
          handleConnectWalletClick={handleConnectWalletClick}
          handleDisconnectWalletClick={handleDisconnectWalletClick}
          profileData={profileData}
        />
      </Router>
    </FinChainProvider>
  );
}

export default App;

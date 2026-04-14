import { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { useFinChain } from '../context/FinChainContext';
import './Dashboard.css';

const Dashboard = () => {
  const { state, dispatch } = useFinChain();
  const { isWalletConnected, isLoading, dashboard, transactions } = state;
  const [activeTab, setActiveTab] = useState('Overview');

  if (!isWalletConnected) return null; // Safety check, handled by App.jsx gate

  const handleRefresh = () => {
    dispatch({ type: 'REFRESH_SYNC' });
  };

  const renderTabs = () => {
    const tabs = ['Overview', 'Wallet Summary', 'Transactions', 'Chain Flow Prediction', 'AI Insights'];
    return (
      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  };

  // --- TAB COMPONENTS ---

  const OverviewTab = () => {
    const { metrics } = dashboard;
    return (
      <div className="tab-content fade-in">
        <div className="top-cards">
          <div className="card balance-card">
            <div className="card-lbl">Current Balance</div>
            <div className="card-val">{metrics.balance.toFixed(2)} ALGO</div>
            <div className="card-sub">Last Active: {metrics.lastActive ? new Date(metrics.lastActive).toLocaleDateString() : 'Never'}</div>
          </div>
          <div className="card stat-card">
            <div className="card-lbl">Total Inflow</div>
            <div className="card-val text-success">+{metrics.totalInflow.toFixed(2)}</div>
            <div className="card-status status-up">↗ {metrics.txCount} txns</div>
          </div>
          <div className="card stat-card">
            <div className="card-lbl">Total Outflow</div>
            <div className="card-val text-danger">-{metrics.totalOutflow.toFixed(2)}</div>
            <div className="card-status status-down">↘ {metrics.totalFees.toFixed(4)} fees</div>
          </div>
          <div className="card stat-card">
            <div className="card-lbl">Net Flow</div>
            <div className="card-val" style={{color: metrics.netFlow >= 0 ? 'var(--success)' : 'var(--danger)'}}>
              {metrics.netFlow >= 0 ? '+' : ''}{metrics.netFlow.toFixed(2)}
            </div>
            <div className="card-status">Status: {state.isWalletConnected ? 'Connected' : 'Disconnected'}</div>
          </div>
        </div>

        <div className="middle-section">
          <div className="card chart-panel">
            <div className="panel-header">
              <h3>On-Chain Flow Analysis</h3>
              <p>Real-time volume accumulation from Algorand history.</p>
            </div>
            <div className="chart-wrapper" style={{ height: 300 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={transactions.map((t, i) => ({ name: i, val: t.amount })).reverse()}>
                   <defs>
                     <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                   <XAxis dataKey="name" hide />
                   <YAxis hide />
                   <Tooltip />
                   <Area type="monotone" dataKey="val" stroke="var(--primary)" fillOpacity={1} fill="url(#colorVal)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
          <div className="card recent-panel">
            <div className="panel-header">
              <h3>Latest Activity</h3>
            </div>
            <div className="mini-tx-list">
              {transactions.slice(0, 4).map((tx, i) => (
                <div key={i} className="mini-tx-item">
                  <div className={`tx-dot ${tx.isReceiver ? 'in' : 'out'}`}></div>
                  <div className="tx-info">
                    <span className="tx-type">{tx.isReceiver ? 'Received' : 'Sent'}</span>
                    <span className="tx-time">{tx.time}</span>
                  </div>
                  <span className={`tx-amt ${tx.isReceiver ? 'text-success' : 'text-danger'}`}>
                    {tx.isReceiver ? '+' : '-'}{tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p className="empty-txt">No transactions recorded.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const WalletSummaryTab = () => {
    const { metrics } = dashboard;
    return (
      <div className="tab-content fade-in">
        <div className="card profile-full-card">
          <div className="summary-grid">
            <div className="summary-item">
              <label>Wallet Address</label>
              <div className="address-box">
                <code>{state.dashboard.metrics.balance ? state.transactions[0]?.sender : '...'}</code>
                <button className="copy-btn">Copy</button>
              </div>
            </div>
            <div className="summary-item">
              <label>Connection Status</label>
              <div className="status-pill connected">TestNet Active</div>
            </div>
            <div className="summary-item">
              <label>Total Network Fees</label>
              <div className="val">{metrics.totalFees.toFixed(6)} ALGO</div>
            </div>
            <div className="summary-item">
              <label>Average Tx Size</label>
              <div className="val">{metrics.avgTxAmount.toFixed(4)} ALGO</div>
            </div>
            <div className="summary-item">
              <label>Transaction Volume</label>
              <div className="val">{metrics.txCount} total events</div>
            </div>
            <div className="summary-item">
              <label>Most Active Period</label>
              <div className="val">Deriving from patterns...</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TransactionsTab = () => {
    return (
      <div className="tab-content fade-in">
        <div className="card table-card">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Intelligence Label</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i}>
                  <td>{new Date(tx.date).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${tx.isReceiver ? 'income' : 'expense'}`}>
                      {tx.isReceiver ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className={tx.isReceiver ? 'text-success' : 'text-danger'}>
                    {tx.isReceiver ? '+' : '-'}{tx.amount.toFixed(4)} ALGO
                  </td>
                  <td>{tx.fee.toFixed(6)}</td>
                  <td><span className="intel-label">{tx.label}</span></td>
                  <td><span className="status-confirmed">Confirmed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <div className="empty-table">No transaction history found on-chain.</div>}
        </div>
      </div>
    );
  };

  const PredictionTab = () => {
    const { prediction } = dashboard;
    return (
      <div className="tab-content fade-in">
        <div className="prediction-grid">
          <div className="card prediction-stats">
            <h3>Chain Flow Forecast</h3>
            <div className="p-stat">
              <label>Projected 30d Inflow</label>
              <div className="val text-success">+{prediction.predictedInflow.toFixed(2)} ALGO</div>
            </div>
            <div className="p-stat">
              <label>Projected 30d Outflow</label>
              <div className="val text-danger">-{prediction.predictedOutflow.toFixed(2)} ALGO</div>
            </div>
            <div className="p-stat">
              <label>Liquidity Risk Level</label>
              <div className={`risk-pill ${prediction.riskLevel.toLowerCase()}`}>{prediction.riskLevel}</div>
            </div>
            <div className="p-stat">
              <label>Model Confidence</label>
              <div className="confidence-msg">AI Confidence: <strong>{prediction.confidence}</strong></div>
            </div>
          </div>
          <div className="card prediction-chart-card">
            <div className="panel-header">
              <h3>Actual vs AI Predicted Trend</h3>
            </div>
            <div className="chart-wrapper" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prediction.curve}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" />
                  <YAxis hide />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predicted" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} name="AI Predicted" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InsightsTab = () => {
    return (
      <div className="tab-content fade-in">
        <div className="insights-container">
          {dashboard.insights.map((ins, i) => (
            <div key={i} className={`insight-card ${ins.type}`}>
              <div className="ins-icon">{ins.icon}</div>
              <div className="ins-body">
                <div className="ins-cat">{ins.category}</div>
                <div className="ins-text">{ins.text}</div>
              </div>
            </div>
          ))}
          {dashboard.insights.length === 0 && (
            <div className="card empty-insights">
              <p>Analyzing on-chain behavior... No critical anomalies found yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab />;
      case 'Wallet Summary': return <WalletSummaryTab />;
      case 'Transactions': return <TransactionsTab />;
      case 'Chain Flow Prediction': return <PredictionTab />;
      case 'AI Insights': return <InsightsTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>FinChain Intelligence</h1>
          <p>Real-time analytics for your Algorand wallet.</p>
        </div>
        <div className="header-right">
          <button className="refresh-btn" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? 'Syncing...' : 'Refresh Data'}
          </button>
        </div>
      </header>

      {renderTabs()}

      <main className="dashboard-main">
        {isLoading && transactions.length === 0 ? (
          <div className="dashboard-skeleton">
            <div className="skeleton-row">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
            <div className="skeleton-big-card"></div>
          </div>
        ) : (
          renderActiveTab()
        )}
      </main>
    </div>
  );
};

export default Dashboard;

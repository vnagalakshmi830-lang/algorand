import { useState, useEffect } from 'react';
import { getAllTransactions, parseTransactions } from '../utils/algorand';
import './Customers.css';

const Customers = ({ accountAddress }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalVolume: 0 });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [sendModalData, setSendModalData] = useState(null);
  const [sendAmount, setSendAmount] = useState('');
  
  const [addCustData, setAddCustData] = useState({ id: '', wallet: '', initialAmount: '' });
  
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendClick = (c) => {
    setSendModalData(c);
  };

  const confirmSendAlgo = () => {
    if (!sendModalData || !sendAmount || isNaN(sendAmount)) return;
    const amount = parseFloat(sendAmount);
    
    setCustomers(prev => prev.map(c => {
      if (c.wallet === sendModalData.wallet) {
        return { ...c, txs: c.txs + 1, volume: c.volume + amount, lastActive: new Date() };
      }
      return c;
    }));
    
    setStats(prev => ({ ...prev, totalVolume: prev.totalVolume - amount }));
    
    setSendModalData(null);
    setSendAmount('');
    showNotification("Success: Transaction Complete");
  };

  const handleAddSubmit = () => {
    if (!addCustData.id || !addCustData.wallet) return;
    const initialAmt = parseFloat(addCustData.initialAmount) || 0;
    
    const newCust = {
      wallet: addCustData.wallet,
      name: addCustData.id,
      txs: 1,
      volume: initialAmt,
      lastActive: new Date(),
      status: 'Active'
    };
    
    setCustomers(prev => [newCust, ...prev]);
    
    setStats(prev => ({ 
      ...prev, 
      total: prev.total + 1,
      totalVolume: prev.totalVolume + initialAmt 
    }));
    
    setShowAddModal(false);
    setAddCustData({ id: '', wallet: '', initialAmount: '' });
    showNotification("Success: Transaction Complete");
  };

  const downloadReport = () => {
    const headers = "Identifier,Wallet Address,Total Txs,Total Volume,Status\n";
    const rows = filtered.map(c => `${c.name},${c.wallet},${c.txs},${c.volume.toFixed(2)},${c.status}`).join("\n");
    const csvContent = headers + rows;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FinChain_Customer_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification("Success: Data Exported");
  };

  const handleNameChange = (wallet, newName) => {
    setCustomers(prev => prev.map(c => c.wallet === wallet ? { ...c, name: newName } : c));
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!accountAddress) return;
      setLoading(true);
      try {
        const rawTxns = await getAllTransactions(accountAddress);
        const parsedTxns = parseTransactions(rawTxns, accountAddress);
        
        const customerMap = {};
        let totalTxVolume = 0;

        parsedTxns.forEach(tx => {
           // Identity the counter-party
           let counterParty = null;
           
           if (tx.isSender && tx.receiver !== accountAddress) {
             counterParty = tx.receiver;
           } else if (tx.isReceiver && tx.sender !== accountAddress) {
             counterParty = tx.sender;
           }

           if (counterParty) {
              if (!customerMap[counterParty]) {
                 customerMap[counterParty] = {
                    wallet: counterParty,
                    name: `Cust_${counterParty.slice(0,4)}`,
                    txs: 0,
                    volume: 0,
                    lastActive: tx.date
                 };
              }

              customerMap[counterParty].txs += 1;
              const val = tx.amount + (tx.isSender ? tx.fee : 0);
              customerMap[counterParty].volume += val;
              totalTxVolume += val;
              
              if (tx.date > customerMap[counterParty].lastActive) {
                customerMap[counterParty].lastActive = tx.date;
              }
           }
        });

        // Determine Status based on recent activity (e.g. within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let activeCount = 0;
        const customerList = Object.values(customerMap).map(c => {
           const isActive = c.lastActive > thirtyDaysAgo;
           if (isActive) activeCount++;
           
           return {
              ...c,
              status: isActive ? "Active" : "Inactive"
           };
        });

        setCustomers(customerList.sort((a,b) => b.txs - a.txs)); // sort by transaction count initially

        setStats({
          total: customerList.length,
          active: activeCount,
          totalVolume: totalTxVolume
        });

      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, [accountAddress]);

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.wallet.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!accountAddress) {
    return (
      <div className="page-container empty-container">
        <div className="empty-state-card">
          <span className="empty-icon">🔌</span>
          <h2>Wallet Not Connected</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container customers-page" style={{ pointerEvents: 'auto' }}>
      <div className="cust-header-cards">
        <div className="card stat-card">
          <div className="stat-icon" style={{background: 'var(--primary-light)', color: 'var(--primary)'}}>👥</div>
          <div className="stat-content">
            <div className="sc-lbl">Total Counterparties</div>
            <div className="sc-val">{stats.total}</div>
          </div>
        </div>
        <div className="card stat-card">
           <div className="stat-icon" style={{background: 'var(--success-light)', color: 'var(--success)'}}>✨</div>
          <div className="stat-content">
            <div className="sc-lbl">Active (Last 30 Days)</div>
            <div className="sc-val">{stats.active}</div>
          </div>
        </div>
        <div className="card stat-card">
           <div className="stat-icon" style={{background: 'var(--danger-light)', color: 'var(--danger)'}}>🔄</div>
          <div className="stat-content">
            <div className="sc-lbl">Total Volume</div>
            <div className="sc-val">{stats.totalVolume.toFixed(2)} ALGO</div>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Customer Directory</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-bar">
              <span>🔍</span>
              <input 
                type="text" 
                placeholder="Search explicitly..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button className="btn-primary" onClick={downloadReport}>Download Report</button>
          </div>
        </div>
        
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center'}}>Extracting customer data...</div>
        ) : (
          <div className="table-responsive">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>Identifier</th>
                  <th>Wallet Address</th>
                  <th>Total Txs</th>
                  <th>Total Volume</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.wallet} className="customer-row" onClick={() => setSelectedCustomer(c)}>
                    <td className="fw-600">
                       <input 
                         type="text"
                         className="alias-input"
                         value={c.name}
                         onChange={(e) => handleNameChange(c.wallet, e.target.value)}
                         onClick={(e) => e.stopPropagation()}
                       />
                    </td>
                    <td>
                       <span className="badge-address" title={c.wallet}>
                         {`${c.wallet.slice(0, 6)}...${c.wallet.slice(-4)}`}
                       </span>
                    </td>
                    <td>{c.txs}</td>
                    <td style={{fontWeight: 600}}>{c.volume.toFixed(2)} ALGO</td>
                    <td>
                      <span className={`status-badge ${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-send-algo" onClick={(e) => { e.stopPropagation(); handleSendClick(c); }}>
                        Send ALGO
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No customers identified from history.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side Drawer */}
      <div className={`side-drawer ${selectedCustomer ? 'open' : ''}`}>
        {selectedCustomer && (
          <div className="drawer-content">
            <button className="close-drawer" onClick={() => setSelectedCustomer(null)}>✕</button>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>User Activity</h2>
            <div className="drawer-details">
              <p><strong>Nickname:</strong> {selectedCustomer.name}</p>
              <p><strong>Wallet Address:</strong> {selectedCustomer.wallet}</p>
              <p><strong>Total Transactions:</strong> {selectedCustomer.txs}</p>
              <p><strong>Total Volume:</strong> {selectedCustomer.volume.toFixed(2)} ALGO</p>
              <p><strong>Status:</strong> {selectedCustomer.status}</p>
              <p><strong>Last Active:</strong> {selectedCustomer.lastActive?.toLocaleString()}</p>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>View Full History</button>
          </div>
        )}
      </div>

      {/* FAB Add Customer */}
      <button className="fab-add" onClick={() => setShowAddModal(true)}>Add</button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Add New Customer</h2>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Customer ID</label>
              <input type="text" placeholder="Enter Customer ID" value={addCustData.id} onChange={e => setAddCustData({...addCustData, id: e.target.value})} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Wallet Address</label>
              <input type="text" placeholder="Enter Algorand Address" value={addCustData.wallet} onChange={e => setAddCustData({...addCustData, wallet: e.target.value})} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Initial ALGO Transfer</label>
              <input type="number" placeholder="Enter Initial Amount" value={addCustData.initialAmount} onChange={e => setAddCustData({...addCustData, initialAmount: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddSubmit}>Save Customer</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {sendModalData && (
        <div className="modal-overlay" onClick={() => setSendModalData(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Send ALGO via FinChain</h2>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Sending to: <strong>{sendModalData.name}</strong></p>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Enter ALGO amount to send</label>
              <input type="number" placeholder="Amount (e.g. 100)" value={sendAmount} onChange={e => setSendAmount(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSendModalData(null)}>Cancel</button>
              <button className="btn-primary" onClick={confirmSendAlgo}>Confirm Transaction</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', background: '#10b981',
          color: 'white', padding: '1rem 2rem', borderRadius: '8px', zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 600,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          ✓ {notification}
        </div>
      )}
    </div>
  );
};

export default Customers;

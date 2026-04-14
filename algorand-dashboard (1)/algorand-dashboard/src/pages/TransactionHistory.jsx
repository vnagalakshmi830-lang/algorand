import { useEffect, useState } from 'react';
import { indexerClient, decodeNote } from '../utils/algorand';
import { Buffer } from 'buffer';
import './TransactionHistory.css';

const TransactionHistory = ({ accountAddress }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!accountAddress) return;
    setLoading(true);
    try {
      // Fetch more transactions for history, e.g., limit 20
      const txInfo = await indexerClient.searchForTransactions()
        .address(accountAddress)
        .limit(20)
        .do();
      
      const filteredTxs = (txInfo.transactions || [])
        .filter(tx => tx.txType === 'pay' || tx['tx-type'] === 'pay')
        .sort((a, b) => Number(b.roundTime || b['round-time'] || 0) - Number(a.roundTime || a['round-time'] || 0));
        
      setTransactions(filteredTxs);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountAddress]);

  if (!accountAddress) {
    return (
      <div className="page-container empty-container">
        <div className="empty-state-card card">
          <span className="empty-icon">🔌</span>
          <h2>Wallet Not Connected</h2>
          <p>Please connect your Pera Wallet to view your transaction history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container page-container">
      <div className="history-header card" style={{marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div className="refresh-section" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
           <p className="text-muted" style={{margin: 0}}>Latest 20 transactions are shown.</p>
        </div>
        <button className="btn-refresh" onClick={fetchTransactions} disabled={loading} style={{background: 'var(--primary)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold'}}>
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="loading-state">Loading history...</div>
      ) : (
        <div className="history-card card">
          {transactions.length === 0 ? (
            <p className="no-data">No transactions found for this account.</p>
          ) : (
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Amount</th>
                    <th>Message / Note</th>
                    <th>Tx ID</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isSender = tx.sender === accountAddress;
                    
                    // Fixed Timestamp bug
                    const rt = tx.roundTime || tx['round-time'];
                    const date = rt ? new Date(Number(rt) * 1000).toLocaleString() : 'Pending...';
                    
                    const confirmedRound = tx.confirmedRound || tx['confirmed-round'];
                    const status = confirmedRound ? "Confirmed" : "Pending";
                    
                    let noteStr = "";
                    if (tx.note) {
                      try {
                        noteStr = new TextDecoder().decode(new Uint8Array(Buffer.from(tx.note, 'base64')));
                      } catch (e) {
                        noteStr = decodeNote(tx.note);
                      }
                    }

                    // Fixed missing receiver and incorrect amount via accessing the correct fields
                    let amount = 0;
                    let receiver = "-";
                    let sender = tx.sender || "-";
                    
                    const payment = tx.paymentTransaction || tx['payment-transaction'];
                    if (payment) {
                      amount = Number(payment.amount) / 1000000;
                      receiver = payment.receiver || "-";
                    }

                    const txId = tx.id || tx?.txn?.txid;

                    return (
                      <tr key={txId}>
                        <td style={{fontWeight: 500}}>{date}</td>
                        <td><span style={{textTransform:'uppercase', fontSize:'0.8rem', background:'var(--bg-color)', padding:'4px 8px', borderRadius:'4px'}}>{tx.txType || tx['tx-type']}</span></td>
                        <td>
                          <span className={`status-badge ${status === 'Confirmed' ? 'active' : 'inactive'}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <span className="badge-address" title={sender}>{`${sender.slice(0, 6)}...${sender.slice(-4)}`}</span>
                        </td>
                        <td>
                          {receiver !== "-" ? (
                            <span className="badge-address" title={receiver}>{`${receiver.slice(0, 6)}...${receiver.slice(-4)}`}</span>
                          ) : "-"}
                        </td>
                        <td className={isSender ? 'text-danger' : 'text-success'} style={{fontWeight: 700}}>
                          {isSender ? '-' : '+'}{amount} ALGO
                        </td>
                        <td className="note-cell" style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={noteStr}>{noteStr || '-'}</td>
                        <td>
                          <a 
                            href={`https://testnet.algoexplorer.io/tx/${txId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline'}}
                            title={txId}
                          >
                            {txId ? `${txId.slice(0, 8)}...` : ''}
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

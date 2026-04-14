import { useState, useEffect } from 'react';
import { getAllTransactions, parseTransactions } from '../utils/algorand';
import './Goals.css';

const Goals = ({ accountAddress }) => {
  const [loading, setLoading] = useState(false);
  const [totalAchieved, setTotalAchieved] = useState(0);
  const [goalsData, setGoalsData] = useState([]);

  // Static target as requested
  const totalTarget = 20000; 

  useEffect(() => {
    const fetchGoals = async () => {
      if (!accountAddress) return;
      setLoading(true);
      try {
        const rawTxns = await getAllTransactions(accountAddress);
        const parsedTxns = parseTransactions(rawTxns, accountAddress);
        
        // Treat ALL incoming transactions as total achieved overall savings
        let achieved = 0;
        
        const baseGoals = [
          { title: "Q3 Expansion", saved: 0, target: 10000, color: "var(--primary)", keywords: ["q3", "expand", "expansion"] },
          { title: "New Office Deposit", saved: 0, target: 5000, color: "var(--success)", keywords: ["office", "deposit"] },
          { title: "Team Retreat", saved: 0, target: 2000, color: "var(--warning)", keywords: ["team", "retreat", "trip"] },
          { title: "Emergency Fund", saved: 0, target: 3000, color: "var(--danger)", keywords: ["emergency", "fund", "save"] },
        ];

        parsedTxns.forEach(tx => {
           if (tx.isReceiver) {
             const amount = tx.amount;
             achieved += amount;
             
             const noteLower = (tx.note || "").toLowerCase();
             
             for (let g of baseGoals) {
                if (g.keywords.some(k => noteLower.includes(k))) {
                   g.saved += amount;
                   break;
                }
             }
           }
        });

        setTotalAchieved(achieved);
        setGoalsData(baseGoals);

      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchGoals();
  }, [accountAddress]);

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

  const overallProgress = totalTarget > 0 ? Math.min(100, (totalAchieved / totalTarget) * 100) : 0;

  return (
    <div className="page-container goals-page">
      <div className="goals-overview card">
        <div className="go-left">
          <h3>Overall Progress</h3>
          <p className="text-muted">You are tracking well against your yearly targets.</p>
          <div className="go-stats">
            <div>
              <p className="lbl">Total Achieved</p>
              <h4>{totalAchieved.toFixed(2)} ALGO</h4>
            </div>
            <div>
              <p className="lbl">Total Target</p>
              <h4>{totalTarget.toLocaleString()} ALGO</h4>
            </div>
          </div>
        </div>
        <div className="go-right">
          <div className="circular-progress-large">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle-fill"
                strokeDasharray={`${overallProgress}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">{overallProgress.toFixed(0)}%</text>
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading goals...</p>
      ) : (
        <div className="goals-grid">
          {goalsData.map((g, i) => {
            const perc = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
            return (
              <div className="card goal-card" key={i}>
                <div className="goal-header">
                  <h4>{g.title}</h4>
                  <div className="goal-perc" style={{ color: g.color }}>{perc.toFixed(0)}%</div>
                </div>
                <div className="goal-amounts">
                  <span className="saved">{g.saved.toFixed(2)} ALGO</span>
                  <span className="target"> / {g.target.toLocaleString()} ALGO</span>
                </div>
                <div className="pb-container lg">
                  <div className="pb-fill" style={{ width: `${perc}%`, backgroundColor: g.color }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;

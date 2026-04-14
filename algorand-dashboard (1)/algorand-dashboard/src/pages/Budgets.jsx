import { useEffect, useState } from 'react';
import { getAllTransactions, parseTransactions, getBalance } from '../utils/algorand';
import './Budgets.css';

const Budgets = ({ accountAddress }) => {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!accountAddress) return;
      setLoading(true);
      try {
        const bal = await getBalance(accountAddress);
        setBalance(bal);

        const rawTxns = await getAllTransactions(accountAddress);
        const parsedTxns = parseTransactions(rawTxns, accountAddress);
        
        let exp = 0;
        
        // Define base categories and budget targets dynamically or static
        const baseCategories = [
          { name: "Marketing", spent: 0, limit: 1250, color: "#4318FF", keywords: ["marketing", "ads", "promo"] },
          { name: "Development", spent: 0, limit: 5000, color: "#868CFF", keywords: ["dev", "code", "aws", "server"] },
          { name: "Operations", spent: 0, limit: 2000, color: "#05cd99", keywords: ["ops", "admin", "legal"] },
          { name: "Sales", spent: 0, limit: 1500, color: "#ffce20", keywords: ["sales", "travel"] },
          { name: "Design", spent: 0, limit: 1000, color: "#ee5d50", keywords: ["design", "ui", "ux"] },
          { name: "Infrastructure", spent: 0, limit: 3000, color: "#a3aed0", keywords: ["infra", "network", "node"] }
        ];

        parsedTxns.forEach(tx => {
          if (tx.isSender) {
            // Include fee in expenses
            const totalOut = tx.amount + tx.fee;
            exp += totalOut;

            let matched = false;
            const noteLower = (tx.note || "").toLowerCase();

            for (let cat of baseCategories) {
              if (cat.name === "Infrastructure") continue;
              if (cat.keywords.some(k => noteLower.includes(k))) {
                cat.spent += totalOut;
                matched = true;
                break;
              }
            }

            if (!matched) {
              const infraCat = baseCategories.find(c => c.name === "Infrastructure");
              infraCat.spent += totalOut;
            }
          }
        });

        // Calculate dynamic total budget
        setTotalSpent(exp);
        setCategoriesData(baseCategories);

      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchBudgetData();
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

  // Assuming overall total budget as a static baseline derived or explicit:
  const totalBudget = categoriesData.reduce((acc, cat) => acc + cat.limit, 0);
  const remaining = Math.max(0, balance); // Remaining actual capacity is balance
  const spentPercent = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="page-container budgets-page">
      <div className="budgets-header-cards">
        <div className="card budget-summary-card">
          <div className="bs-label">Configured Total Budget</div>
          <div className="bs-value">{totalBudget.toLocaleString()} ALGO</div>
        </div>
        <div className="card budget-summary-card">
          <div className="bs-label">Total Outgoing (All Time)</div>
          <div className="bs-value text-danger">{totalSpent.toFixed(2)} ALGO</div>
        </div>
        <div className="card budget-summary-card">
          <div className="bs-label">Current Balance Remaining</div>
          <div className="bs-value text-success">{remaining.toFixed(2)} ALGO</div>
        </div>
      </div>

      <div className="card full-width-card">
        <h3>Overall Progress Against Expected Budget</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="pb-container lg">
              <div className="pb-fill" style={{ width: `${spentPercent}%`, backgroundColor: spentPercent > 90 ? 'var(--danger)' : 'var(--primary)' }}></div>
            </div>
            <p className="pb-text">{spentPercent.toFixed(1)}% of planned budget used</p>
          </>
        )}
      </div>

      <div className="categories-grid">
        {!loading && categoriesData.map((cat, idx) => {
          const catPercent = cat.limit > 0 ? Math.min(100, (cat.spent / cat.limit) * 100) : 100;
          const isExceeded = cat.spent > cat.limit;
          
          return (
            <div className="card category-card" key={idx}>
              <div className="cat-header">
                <h4>{cat.name}</h4>
                <div className={`status-indicator ${isExceeded ? 'red' : 'green'}`}></div>
              </div>
              <div className="cat-amounts">
                <span>{cat.spent.toFixed(2)}</span>
                <span className="text-muted"> / {cat.limit} ALGO</span>
              </div>
              <div className="pb-container">
                <div className="pb-fill" style={{ width: `${catPercent}%`, backgroundColor: isExceeded ? 'var(--danger)' : cat.color }}></div>
              </div>
              {isExceeded && <span className="exceed-warning">Budget exceeded!</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;

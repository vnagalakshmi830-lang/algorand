import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getAllTransactions, parseTransactions } from '../utils/algorand';
import './Forecast.css';

const Forecast = ({ accountAddress }) => {
  const [timeframe, setTimeframe] = useState('Monthly');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ projectedIncome: 0, projectedExpenses: 0, netForecast: 0 });

  useEffect(() => {
    const fetchForecastData = async () => {
      if (!accountAddress) return;
      setLoading(true);
      try {
        const rawTxns = await getAllTransactions(accountAddress);
        const parsedTxns = parseTransactions(rawTxns, accountAddress);
        
        // Group by Month (e.g., 'Jan', 'Feb')
        const monthlyGroups = {};

        parsedTxns.forEach(tx => {
          const m = tx.date.toLocaleString('default', { month: 'short' });
          if (!monthlyGroups[m]) {
             monthlyGroups[m] = { name: m, income: 0, expense: 0, sortKey: tx.date.getMonth() };
          }
          if (tx.isSender) {
            monthlyGroups[m].expense += tx.amount + tx.fee;
            if (tx.isReceiver) monthlyGroups[m].income += tx.amount; // self tx
          } else if (tx.isReceiver) {
            monthlyGroups[m].income += tx.amount;
          }
        });

        // Convert to array and sort chronologically according to standard calendar
        let groupedArray = Object.values(monthlyGroups).sort((a,b) => a.sortKey - b.sortKey);
        
        // If data is very sparse, seed some empty months
        if (groupedArray.length === 0) {
           groupedArray = [
             { name: 'Jan', income: 0, expense: 0 },
             { name: 'Feb', income: 0, expense: 0 }
           ];
        }

        setChartData(groupedArray);

        // Averages for projection
        let totalInc = 0;
        let totalExp = 0;
        groupedArray.forEach(g => {
          totalInc += g.income;
          totalExp += g.expense;
        });
        
        const avgInc = groupedArray.length > 0 ? totalInc / groupedArray.length : 0;
        const avgExp = groupedArray.length > 0 ? totalExp / groupedArray.length : 0;

        // Arbitrary projection based on historical average
        setStats({
          projectedIncome: avgInc,
          projectedExpenses: avgExp,
          netForecast: avgInc - avgExp
        });

      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchForecastData();
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

  return (
    <div className="page-container forecast-page">
      <div className="forecast-header-cards">
        <div className="card stat-card forecast-stat">
          <div className="fs-lbl">Avg. Projected Monthly Income</div>
          <div className="fs-val text-success">+{stats.projectedIncome.toFixed(2)} ALGO</div>
        </div>
        <div className="card stat-card forecast-stat">
          <div className="fs-lbl">Avg. Projected Monthly Expenses</div>
          <div className="fs-val text-danger">-{stats.projectedExpenses.toFixed(2)} ALGO</div>
        </div>
        <div className="card stat-card forecast-stat">
          <div className="fs-lbl">Net Monthly Forecast</div>
          <div className="fs-val">{stats.netForecast.toFixed(2)} ALGO</div>
        </div>
      </div>

      <div className="card chart-card">
        <div className="chart-header">
          <h3>Historical Cashflow & Forecasting</h3>
          <div className="chart-toggles">
            <button className={timeframe === 'Monthly' ? 'active' : ''} onClick={() => setTimeframe('Monthly')}>Monthly</button>
            <button className={timeframe === 'Yearly' ? 'active' : ''} onClick={() => setTimeframe('Yearly')}>Yearly</button>
          </div>
        </div>
        
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center'}}>Loading projection models...</div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#05cd99" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#05cd99" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ee5d50" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ee5d50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#a3aed0" />
                <YAxis stroke="#a3aed0" formatter={(value) => `${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  formatter={(value) => `${value.toFixed(2)} ALGO`}
                />
                <Area type="monotone" dataKey="income" name="Incoming" stroke="#05cd99" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Outgoing" stroke="#ee5d50" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecast;

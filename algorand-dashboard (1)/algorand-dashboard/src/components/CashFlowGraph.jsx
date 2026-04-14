import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CashFlowGraph = ({ transactions, accountAddress, loading }) => {
  // Transform data
  const { chartData } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { chartData: [] };
    }

    const dailyData = {};

    transactions.forEach(tx => {
      // Fix field lookups for graph
      if (tx.txType !== 'pay' && tx['tx-type'] !== 'pay') return;
      const payment = tx.paymentTransaction || tx['payment-transaction'];
      if (!payment) return;

      const rt = tx.roundTime || tx['round-time'];
      const dateObj = rt ? new Date(Number(rt) * 1000) : new Date();
      const dateStr = dateObj.toISOString().split('T')[0];
      const displayDate = dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric' });

      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, displayDate, incoming: 0, outgoing: 0 };
      }

      const isSender = tx.sender === accountAddress;
      const isReceiver = payment.receiver === accountAddress;
      const amount = Number(payment.amount) / 1000000;
      const fee = Number(tx.fee || 0) / 1000000;

      if (isSender) {
        const totalOut = amount + fee;
        dailyData[dateStr].outgoing += totalOut;
        
        if (isReceiver) {
          dailyData[dateStr].incoming += amount;
        }
      } else if (isReceiver) {
        dailyData[dateStr].incoming += amount;
      }
    });

    const dataArray = Object.values(dailyData);
    dataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

    return { chartData: dataArray };
  }, [transactions, accountAddress]);

  if (loading) {
    return <div style={{padding: '40px', textAlign: 'center'}}>Loading flow...</div>;
  }

  if (chartData.length === 0) {
    return <div style={{padding: '40px', textAlign: 'center'}}>No transaction data.</div>;
  }

  return (
    <div className="cfr" style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cfInc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="cfExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis 
            dataKey="displayDate" 
            stroke="var(--text-muted)" 
            tick={{fill: 'var(--text-muted)', fontSize: 12}} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            stroke="var(--text-muted)" 
            tick={{fill: 'var(--text-muted)', fontSize: 12}} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
            itemStyle={{ fontWeight: 600 }}
          />
          <Area 
            type="monotone" 
            dataKey="incoming" 
            stroke="var(--success)" 
            fillOpacity={1} 
            fill="url(#cfInc)" 
            strokeWidth={3}
          />
          <Area 
            type="monotone" 
            dataKey="outgoing" 
            stroke="var(--danger)" 
            fillOpacity={1} 
            fill="url(#cfExp)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowGraph;

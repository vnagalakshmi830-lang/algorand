import express from 'express';
import cors from 'cors';

const app = express();
// STEP 2: Use port 5000 as requested
const PORT = process.env.PORT || 5000;

// STEP 5: Handle CORS issues properly
app.use(cors());
app.use(express.json());

// In-memory data store for coupons
let coupons = [];
let nextId = 1;

app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

app.post('/api/coupons', (req, res) => {
  const { title, code, discountPercent, expiryDate } = req.body;
  
  if (!title || !code || !discountPercent || !expiryDate) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newCoupon = {
    id: nextId++,
    title,
    code,
    discountPercent: Number(discountPercent),
    expiryDate
  };

  coupons.push(newCoupon);
  res.status(201).json(newCoupon);
});

// STEP 3: Fix the API endpoint (POST /api/chat)
app.post('/api/chat', (req, res) => {
  try {
    const { message, contextData } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const query = message.toLowerCase();
    let reply = "I am FinChain AI, your Web3 Financial Analyst. 📊 Please remind your team to 'Connect Wallet' to view detailed on-chain data and analytics.";

    const hasState = contextData && Object.keys(contextData).length > 0;
    
    // Extracted live data fallback values based on the prompt instructions
    const balanceInfo = hasState && contextData.dashboard?.balance ? contextData.dashboard.balance.toFixed(2) : "~7.59";
    const netChange = hasState && contextData.dashboard?.income && contextData.dashboard?.expenses ? `+${(contextData.dashboard.income - contextData.dashboard.expenses).toFixed(2)}` : "+125.57";

    if (query.includes('hi') || query.includes('hello')) {
      reply = "Welcome back, Co-Founder! 🚀 I'm FinChain AI. I'm here to help optimize our business burn rate, analyze ALGO flow, and track budgets. What are we looking at today?";
    } else if (query.includes('balance') || query.includes('net change') || query.includes('income') || query.includes('liquidity')) {
      reply = `Your Total Balance is ${balanceInfo} ALGO, and your Net Change is ${netChange} ALGO. Net flow tracks the difference between your incoming revenue and outgoing operational expenses. 📊`;
    } else if (query.includes('runway') || query.includes('burn')) {
      reply = "Monitoring our burn rate is critical for survival. ⚡ Based on projected next week's burn (Marketing is at $8.5k/$12k, R&D is at $9.8k/$10k), we should ensure sufficient ALGO reserves or cut non-essential cloud costs.";
    } else if (query.includes('budget') || query.includes('category') || query.includes('marketing')) {
      reply = "You can view your specific categories—like Marketing, Operations, R&D, and Salaries—under the 'Budgets' tab. 📂 For example, we spent more on marketing this week ($8.5k of $12k budget).";
    } else if (query.includes('alert') || query.includes('spike')) {
      reply = "Smart Alert: Abnormal spike in expenses detected! Ensure to review your recent R&D and Marketing spend on the dashboard.";
    } else if (query.includes('goal')) {
      reply = "We are currently at 67% achieved for our Savings Goal, and moving towards our Customer Growth target (12/15).";
    } else if (query.includes('reduce cost') || query.includes('optimize') || query.includes('expensive')) {
      reply = "I recommend applying our partner coupons! 🏷️ Check the 'Coupons' tab to grab your 20% off SaaS tools or the 5% early payment cashback to significantly reduce your cloud and hosting costs.";
    } else if (query.includes('stock') || query.includes('trade') || query.includes('buy bitcoin')) {
      reply = "I must clarify that FinChain focuses strictly on on-chain operational finance and ALGO treasury management. 🏦 We do not support speculative stock or generic crypto trading.";
    } else if (query.includes('payment') || query.includes('server')) {
      reply = "Keeping an eye on upcoming payments is essential. You can track high-priority costs like Server Hosting and Marketing Agencies directly from the Dashboard.";
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

// Basic health check
app.get('/', (req, res) => {
  res.send('Fintech Backend API is running.');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

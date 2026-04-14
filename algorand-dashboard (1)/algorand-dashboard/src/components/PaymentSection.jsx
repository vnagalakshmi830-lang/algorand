import React, { useState } from 'react';
import './PaymentSection.css';

const PaymentSection = ({ appliedCoupon }) => {
  const [paymentDateStr, setPaymentDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [dueDateStr, setDueDateStr] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [paymentStatus, setPaymentStatus] = useState(null); // 'on-time' | 'late'

  const BASE_AMOUNT = 1000;

  const calculatePayment = () => {
    const paymentDate = new Date(paymentDateStr);
    const dueDate = new Date(dueDateStr);
    // Reset time for comparison
    paymentDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const isLate = paymentDate > dueDate;

    if (isLate) {
      setPaymentStatus('late');
    } else {
      setPaymentStatus('on-time');
    }
  };

  const renderResult = () => {
    if (!paymentStatus) return null;

    if (paymentStatus === 'late') {
      const penaltyAmount = BASE_AMOUNT * 0.05;
      const finalAmount = BASE_AMOUNT + penaltyAmount;

      return (
        <div className="payment-result late">
          <h4>Payment Result (Late)</h4>
          <div className="result-row">
            <span>Original Amount</span>
            <span>₹{BASE_AMOUNT}</span>
          </div>
          <div className="result-row penalty">
            <span>Penalty Added (5%)</span>
            <span>+₹{penaltyAmount}</span>
          </div>
          <div className="result-row total">
            <span>Final Amount</span>
            <span>₹{finalAmount}</span>
          </div>
          <div className="status-message error">
            Late Payment Penalty Applied. Discount from coupon was voided.
          </div>
        </div>
      );
    }

    if (paymentStatus === 'on-time') {
      let discountAmount = 0;
      if (appliedCoupon) {
        discountAmount = BASE_AMOUNT * (appliedCoupon.discountPercent / 100);
      }
      const finalAmount = BASE_AMOUNT - discountAmount;

      return (
        <div className="payment-result on-time">
          <h4>Payment Result (On-Time)</h4>
          <div className="result-row">
            <span>Original Amount</span>
            <span>₹{BASE_AMOUNT}</span>
          </div>
          <div className="result-row discount">
            <span>Discount Applied {appliedCoupon ? `(${appliedCoupon.discountPercent}%)` : '(None)'}</span>
            <span>-₹{discountAmount}</span>
          </div>
          <div className="result-row total">
            <span>Final Amount</span>
            <span>₹{finalAmount}</span>
          </div>
          <div className="status-message success">
            {appliedCoupon ? "Discount Applied Successfully" : "Paid on time. Apply a coupon for discount!"}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="payment-section-card">
      <div className="payment-section-header">
        <h3>Payment Simulator</h3>
        <p>Test the Fintech Payment Rules with ₹{BASE_AMOUNT} base amount.</p>
      </div>

      <div className="payment-controls">
        <div className="form-group">
          <label>Due Date</label>
          <input 
            type="date" 
            className="form-control" 
            value={dueDateStr} 
            onChange={(e) => setDueDateStr(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Payment Date</label>
          <input 
            type="date" 
            className="form-control" 
            value={paymentDateStr} 
            onChange={(e) => setPaymentDateStr(e.target.value)}
          />
        </div>
        
        <button className="btn-calculate" onClick={calculatePayment}>
          Process Payment
        </button>
      </div>

      {renderResult()}
    </div>
  );
};

export default PaymentSection;

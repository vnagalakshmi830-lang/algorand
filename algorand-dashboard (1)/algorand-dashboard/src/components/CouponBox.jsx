import React from 'react';
import './CouponBox.css';

const CouponBox = ({ coupon, onApply, appliedCouponId }) => {
  const isApplied = appliedCouponId === coupon.id;
  const isExpired = new Date(coupon.expiryDate) < new Date();

  return (
    <div className={`coupon-card ${isExpired ? 'expired' : ''} ${isApplied ? 'applied' : ''}`}>
      <div className="coupon-card-header">
        <h4 className="coupon-title">{coupon.title}</h4>
        <span className="coupon-discount">{coupon.discountPercent}% OFF</span>
      </div>
      <div className="coupon-card-body">
        <div className="coupon-code-container">
          <span className="coupon-code-label">CODE:</span>
          <span className="coupon-code-value">{coupon.code}</span>
        </div>
        <p className="coupon-expiry">
          Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
        </p>
      </div>
      <div className="coupon-card-footer">
        <button 
          className={`coupon-apply-btn ${isApplied ? 'applied-btn' : ''}`}
          onClick={() => onApply(coupon)}
          disabled={isApplied || isExpired}
        >
          {isApplied ? 'Applied' : isExpired ? 'Expired' : 'Apply Coupon'}
        </button>
      </div>
    </div>
  );
};

export default CouponBox;

import React, { useState, useEffect } from 'react';
import CouponBox from '../components/CouponBox';
import PaymentSection from '../components/PaymentSection';
import Modal from '../components/Modal';
import './Coupons.css';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appliedCouponId, setAppliedCouponId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('5');
  const [expiryDate, setExpiryDate] = useState('');

  // Fetch Coupons on Mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          code,
          discountPercent,
          expiryDate
        })
      });

      if (response.ok) {
        const newCoupon = await response.json();
        setCoupons([...coupons, newCoupon]);
        setIsModalOpen(false);
        // Reset form
        setTitle('');
        setCode('');
        setDiscountPercent('5');
        setExpiryDate('');
      } else {
        alert('Failed to create coupon.');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Error creating coupon.');
    }
  };

  const handleApplyCoupon = (coupon) => {
    const isExpired = new Date(coupon.expiryDate) < new Date();
    if (isExpired) {
      alert("Coupon Expired");
      return;
    }
    setAppliedCouponId(coupon.id);
  };

  // Find the selected coupon object
  const appliedCoupon = coupons.find(c => c.id === appliedCouponId);

  return (
    <div className="page-container coupons-page">
      <div className="coupons-header-section">
        <div className="header-text">
          <h2 className="title">Coupon Management</h2>
          <p className="subtitle">Admin Dashboard for FinTech Platform</p>
        </div>
        <button className="btn-add-coupon" onClick={() => setIsModalOpen(true)}>
          <span className="plus-icon">+</span> Create Coupon
        </button>
      </div>

      <div className="coupons-grid">
        {coupons.length === 0 ? (
          <div className="empty-state">No coupons created yet.</div>
        ) : (
          coupons.map(coupon => (
            <CouponBox 
              key={coupon.id} 
              coupon={coupon} 
              onApply={handleApplyCoupon}
              appliedCouponId={appliedCouponId}
            />
          ))
        )}
      </div>

      {/* Payment Section Simulator */}
      <PaymentSection appliedCoupon={appliedCoupon} />

      {/* Modern Modal for Coupon Creation */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Coupon"
      >
        <form onSubmit={handleCreateCoupon}>
          <div className="form-group">
            <label>Coupon Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              placeholder="e.g. Welcome Bonus"
            />
          </div>
          <div className="form-group">
            <label>Coupon Code</label>
            <input 
              type="text" 
              className="form-control" 
              value={code} 
              onChange={e => setCode(e.target.value.toUpperCase())} 
              required 
              placeholder="e.g. JOIN10"
            />
          </div>
          <div className="form-group">
            <label>Discount Percentage</label>
            <select 
              className="form-control" 
              value={discountPercent} 
              onChange={e => setDiscountPercent(e.target.value)}
            >
              <option value="5">5%</option>
              <option value="10">10%</option>
            </select>
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={expiryDate} 
              onChange={e => setExpiryDate(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary">Save Coupon</button>
        </form>
      </Modal>
    </div>
  );
};

export default Coupons;

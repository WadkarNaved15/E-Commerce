import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import '../../styles/Cart/CartPrice.css';
import { encryptData, decryptData } from '../../utils/Encryption';

const CartPrice = ({ quantity, subtotal, discount, discountedSubtotal, tax, shippingCharges, total , dispalyCoupon = false , updateTotals }) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      const encryptedData = encryptData(JSON.stringify({ couponCode, total }));
      const response = await apiClient.post('/coupon/apply', { encryptedData });
      if (response.data.success) {
        setCouponDiscount(response.data.discount);
        const updatedTotal = {
          quantity,
          subtotal,
          discount,
          couponDiscount: response.data.discount,
          discountedSubtotal: discountedSubtotal - response.data.discount,
          tax,
          shippingCharges,
          total: total - response.data.discount,
        }
        updateTotals(updatedTotal);
        setCouponError('');
      } else {
        setCouponError(response.data.error || 'Failed to apply coupon');
        setCouponDiscount(0);
      }
    } catch (error) {
      setCouponError('An error occurred. Please try again.');
      setCouponDiscount(0);
    }
  };

  const finalTotal = total - couponDiscount;

  return (
    <div className="cart-price">
      <h3>Price Details</h3>
      <div>
        <p>Price ({quantity} items)</p>
        <p>RS. {subtotal}</p>
      </div>
      <div>
        <p>Discount</p>
        <p className="discount">- RS. {discount}</p>
      </div>
      <div>
        <p>Coupon Discount</p>
        <p className="discount">- RS. {couponDiscount}</p>
      </div>
      <div>
        <p>Tax</p>
        <p>{tax}</p>
      </div>
      <div>
        <p>Delivery Charges</p>
        <p>{shippingCharges}</p>
      </div>
      <div>
        <b>Total Amount</b>
        <b>RS. {finalTotal}</b>
      </div>
      {dispalyCoupon && <div className="coupon-section">
        <div>
        <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button onClick={handleApplyCoupon}>Apply Coupon</button>
        </div>
  
        {couponError && <p className="coupon-error">{couponError}</p>}
        {couponDiscount > 0 && <p className="coupon-success">Coupon Discount: RS. {couponDiscount}</p>}
      </div>}
    </div>
  );
};

export default CartPrice;

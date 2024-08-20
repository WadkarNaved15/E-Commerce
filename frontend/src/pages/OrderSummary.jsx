import React, { useState } from "react";
import "../styles/Order/OrderSummary.css";
import { useLocation, useNavigate } from "react-router";
import { VscPackage } from "react-icons/vsc";
import { FaMoneyBillWave, FaCreditCard, FaRegCalendarCheck, FaTruck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { encryptData } from '../utils/Encryption';
import apiClient from "../utils/apiClient";

function OrderSummary() {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    const [orderStatus, setOrderStatus] = useState(state.status || []);
    const [showModal, setShowModal] = useState(false);
  
    const statusIcons = {
      Ordered: FaRegCalendarCheck,
      Shipped: FaTruck,
      Delivered: CheckIcon,
      Cancelled: CancelIcon, // Add icon for Cancelled status
    };
    const handleCancelOrder = async () => {
        try {
            const encryptedData = encryptData(JSON.stringify(state._id));
            const response = await apiClient.post(`/order/cancel`, {
                orderId: encryptedData,
            });
    
            if (response.status === 200) {
                // Update the order status to include "Cancelled"
                const updatedStatus = [...orderStatus, { status: "Cancelled", date: new Date() }];
                setOrderStatus(updatedStatus);
    
                // Show success notification
                toast.success("Order cancelled successfully! Refund process initiated.");
    
                // Optionally redirect or refresh the page
                navigate(`/my-orders`);
            } else {
                throw new Error(response.data.message || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error("Failed to cancel the order. Please try again.");
        }
    };
    const confirmCancelOrder = () => {
      setShowModal(true);
    };
  
    const handleConfirmCancel = () => {
      setShowModal(false);
      handleCancelOrder();
    };
  
    const handleCloseModal = () => {
      setShowModal(false);
    };
  
    const currentStatus = orderStatus[orderStatus.length - 1]?.status;
    const badgeClass = `badge badge-${currentStatus}`;
  
    return (
      <div className="order-summary">
        <div className="order-summary-header">
          <div className="order-id">
            <VscPackage className="icon" />
            <h1>Order #{state.order_number}</h1>
          </div>
          <div className="status-with-cancel">
            <span className={badgeClass}>{currentStatus}</span>
            {!orderStatus.some(status => status.status === "Delivered") && !orderStatus.some(status => status.status === "Cancelled") && (
              <button className="cancel-order-button" onClick={confirmCancelOrder}>
                Cancel Order
              </button>
            )}
          </div>
        </div>
  
        <div className="order-timeline">
          {orderStatus
            .filter(status => status.status !== 'Pending') // Exclude 'Pending' status
            .map((status, index) => {
              const IconComponent = statusIcons[status.status]; // Select appropriate icon
              return (
                <div className="timeline-item" key={index}>
                  <IconComponent className="icon" />
                  <span>{status.status} on {new Date(status.date).toLocaleDateString()}</span>
                </div>
              );
            })}
        </div>
  
        {/* Confirmation Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Confirm Cancellation</h2>
              <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
              <div className="modal-buttons">
                <button className="modal-confirm-button" onClick={handleConfirmCancel}>Confirm</button>
                <button className="modal-cancel-button" onClick={handleCloseModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
  
        <div className="card">
          <div className="card-header">
            <h2>Order Details</h2>
          </div>
          <div className="card-content">
            <div className="order-items">
              <div className="items-header">
                <span>Items</span>
                <span>{state.items.length}</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((item) => (
                    <tr key={item._id}>
                      <td onClick={() => navigate(`/product/${item.product.name}`)} className="item-name">{item.product.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <hr />
            <div className="order-summary-details">
              <div className="summary-header">Summary</div>
              <div className="summary-item">
                <span>Subtotal</span>
                <span>₹{state.total_amount}</span>
              </div>
              <div className="summary-item">
                <span>Shipping</span>
                <span>₹5.00</span>
              </div>
              <div className="summary-item">
                <span>Tax</span>
                <span>₹14.40</span>
              </div>
              <hr />
              <div className="summary-total">
                <span>Total</span>
                <span>₹{state.total_amount + 5 + 14.40}</span>
              </div>
            </div>
          </div>
        </div>
  
        <div className="address-payment-section">
          <div className="card">
            <div className="card-header">
              <h2>Shipping Address</h2>
            </div>
            <div className="card-content">
              <div className="address-name">{state.shipping_address.name}&nbsp;&nbsp;&nbsp;{state.shipping_address.phoneNumber}&nbsp;&nbsp;&nbsp;{state.shipping_address?.alternatePhoneNumber}</div>
              <div>{state.shipping_address.address_line1}</div>
              <div>
                {state.shipping_address.locality}, {state.shipping_address.city},{" "}
                {state.shipping_address.state}, {state.shipping_address.pinCode}
              </div>
              <div>{state.shipping_address.country}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h2>Payment Method</h2>
            </div>
            <div className="card-content">
              <div className="payment-method">
                <div className="icon-placeholder">
                  {state.payment_method === 'COD' && <FaMoneyBillWave className="icon" />}
                  {state.payment_method === 'Razorpay' && <FaCreditCard className="icon" />}
                </div>
                <div>
                  <div>{state.payment_method}</div>
                  {state.payment_date && <div>Charged on {new Date(state.payment_date).toLocaleDateString()}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  function CheckIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  
  function CancelIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  
  export default OrderSummary;
  
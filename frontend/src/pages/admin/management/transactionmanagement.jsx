import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import "../../../styles/admin-styles/products.css";

const img =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8&w=1000&q=804";

const orderItems = [
  {
    name: "Puma Shoes",
    photo: img,
    id: "asdsaasdas",
    quantity: 4,
    price: 2000,
  },
];

const statusOptions = ["Processing", "Shipped", "Delivered", "Cancelled"];

const TransactionManagement = () => {
  const server = import.meta.env.VITE_SERVER
  const [order, setOrder] = useState({
    name: "Puma Shoes",
    address: "77 black street",
    city: "New York",
    state: "Nevada",
    country: "US",
    pinCode: 242433,
    status: "Processing",
    subtotal: 4000,
    discount: 1200,
    shippingCharges: 0,
    tax: 200,
    total: 4000 + 200 + 0 - 1200,
    orderItems,
  });

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setOrder((prev) => ({
      ...prev,
      status,
    }));
    setShowStatusDropdown(false); // Hide dropdown after selection
  };

  const toggleDropdown = () => {
    setShowStatusDropdown((prev) => !prev);
  };

  const updateOrder = async () => {
    try {
      const response = await fetch(`${server}/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder.data); // Update state with the updated order
        alert('Order updated successfully');
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <section
          style={{
            padding: "2rem",
          }}
        >
          <h2>Order Items</h2>

          {orderItems.map((i) => (
            <ProductCard
              key={i.id}
              name={i.name}
              photo={`${i.photo}`}
              productId={i.id}
              quantity={i.quantity}
              price={i.price}
            />
          ))}
        </section>

        <article className="shipping-info-card">
          <button className="product-delete-btn" onClick={() => setOrder((prev) => ({ ...prev, status: "Cancelled" }))}>
            <FaTrash />
          </button>
          <h1>Order Info</h1>
          <h5>User Info</h5>
          <p>Name: {order.name}</p>
          <p>
            Address: {`${order.address}, ${order.city}, ${order.state}, ${order.country} ${order.pinCode}`}
          </p>
          <h5>Amount Info</h5>
          <p>Subtotal: ₹{order.subtotal}</p>
          <p>Shipping Charges: ₹{order.shippingCharges}</p>
          <p>Tax: ₹{order.tax}</p>
          <p>Discount: ₹{order.discount}</p>
          <p>Total: ₹{order.total}</p>

          <h5>Status Info</h5>
          <p>
            Status:{" "}
            <span
              className={
                order.status === "Delivered"
                  ? "purple"
                  : order.status === "Shipped"
                  ? "green"
                  : "red"
              }
            >
              {order.status}
            </span>
          </p>

          <button className="shipping-btn" onClick={toggleDropdown}>
            Process Status
          </button>

          {showStatusDropdown && (
            <div className="status-dropdown">
              {statusOptions.map((status) => (
                <div
                  key={status}
                  className="status-option"
                  onClick={() => handleStatusChange(status)}
                >
                  {status}
                </div>
              ))}
            </div>
          )}

          <button className="update-btn" onClick={updateOrder}>
            Update Order
          </button>
        </article>
      </main>
    </div>
  );
};

const ProductCard = ({
  name,
  photo,
  price,
  quantity,
  productId,
}) => (
  <div className="transaction-product-card">
    <img src={photo} alt={name} />
    <Link to={`/product/${productId}`}>{name}</Link>
    <span>
      ₹{price} X {quantity} = ₹{price * quantity}
    </span>
  </div>
);

export default TransactionManagement;

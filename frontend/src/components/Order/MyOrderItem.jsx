import React from 'react';
import { GoDotFill } from "react-icons/go";
import { MdOutlineRateReview } from "react-icons/md";
import { useNavigate } from 'react-router';
import "../../styles/Order/MyOrderItem.css";

const MyOrderItem = ({ order }) => {
    const navigate = useNavigate();
    const server = import.meta.env.VITE_SERVER;

    // Extract the most recent status item if it exists
    const statusItem = order.status && order.status.length > 0 ? order.status[order.status.length - 1] : null;

    const statusColor = statusItem
        ? statusItem.status === "Delivered"
            ? "green"
            : statusItem.status === "Shipped"
                ? "blue"
                : statusItem.status === "Ordered"
                    ? "orange"
                    : "red"
        : "gray";

    const handleReviewClick = (event, productId) => {
        event.stopPropagation(); // Prevent parent container's onClick from firing
        navigate('/review-form', {
            state: { product_id: productId } // Pass the specific product ID to the review form
        });
    };

    return (
        <div className='my-order-item-container' onClick={() => navigate(`/order-summary`, { state: order })}>
            <h5># {order.order_number}</h5>
            <div className="my-order-item">
                <div className="my-all-order-items">
                    {order.items.map((item, index) => (
                        <div key={index} className="my-order-item-product">
                            <div className="my-order-item-img">
                                <img 
                                    src={`${server}/${item.product.images[0].url}`} 
                                    alt={item.product.name} 
                                />
                            </div>
                            <div className="my-order-item-details">
                                <p className='my-order-item-name'>{item.product.name}</p>
                                <p className='my-order-item-brand'>Brand: {item.product.brand}</p>
                                {statusItem?.status === "Delivered" && (
                                    <div onClick={(e) => handleReviewClick(e, item.product._id)} className="my-order-review">
                                        <p><MdOutlineRateReview /> Rate & Review this product</p>
                                    </div>
                                )}
                            </div>
                            <div className="my-order-item-price">
                                <p>Price: ₹{item.price}</p>
                                <p>X {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="my-order-total">
                    <p>Total Amount: ₹{order.total_amount}</p>
                </div>
                <div className="my-order-status">
                    <p className='my-order-item-order-status' style={{ display: 'flex', alignItems: 'center' }}>
                        <GoDotFill color={statusColor} style={{ marginRight: '5px' }} /> 
                        {statusItem ? `${statusItem.status} on ${new Date(statusItem.date).toLocaleDateString()}` : "Pending"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MyOrderItem;

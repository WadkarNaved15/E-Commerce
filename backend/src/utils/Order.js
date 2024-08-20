import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { decryptData , encryptData } from './Encryption.js';

const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_SECRET_KEY,
});

const generateOrderNumber = async () => {
    let orderNumber = 'ORD-0000001'; // Default starting number with 7 digits
    const lastOrder = await Order.findOne().sort({ order_number: -1 }).exec();
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.order_number.replace('ORD-', ''));
      orderNumber = `ORD-${(lastNumber + 1).toString().padStart(7, '0')}`; 

    }
    return orderNumber;
  };
  
export const createOrder = async (req, res) => {
    const { encryptedData } = req.body;
    const { customer, order_date, amount, items , shipping_address, payment_method  } = JSON.parse(decryptData(encryptedData));
    const order_number = await generateOrderNumber();
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: crypto.randomBytes(16).toString('hex'),
            payment_capture: 1, // Auto capture payment
        });
        // Save order details in MongoDB
        const orderData = {
          order_number,
          customer,
          order_date,
          total_amount: amount,
          items,
          shipping_address,
          payment_method,
          payment_id: razorpayOrder.id
        };
    
        if (payment_method === 'COD') {
          orderData.status = [
            {
              status: 'Ordered',
              date: new Date()
            }
          ];
        }

        const order = new Order(orderData);
        await order.save();
        const encryptedResponse = encryptData(JSON.stringify({
          orderId: order._id,
          razorpayOrderId: razorpayOrder.id
        }));

    
        res.status(201).json({ success: true, data:encryptedResponse  });
};


export const getOrders = async (req, res) => {
    const userId = req.user.id;
    const orders = await Order.find({ customer: userId }).populate('items.product');
    res.status(200).json({ success: true, data: orders });
}   

export const updateOrder = async (req, res) => {
        const { encryptedData } = req.body;
        const { orderId, paymentId } = JSON.parse(decryptData(encryptedData));
        try {
          const order = await Order.findById(orderId);
      
          if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
          }
      
          // Update order status based on payment method
          if (paymentId) {
            // Update for Razorpay
            order.payment_id = paymentId;
            order.payment_status = 'Paid'; 
            order.status.push({
              status: 'Ordered',
              date: new Date() 
            });
          } else {
            // Update for Cash on Delivery
            order.payment_status = 'Pending'; // Set status to 'Pending' or another relevant status
          }
      
          // Save the updated order
          await order.save();
      
          res.status(200).json({ success: true });
        } catch (error) {
          console.error('Error updating order:', error);
          res.status(500).json({ success: false, message: 'Server error' });
        }
      };


export const verifyPayment = async (req, res) => {
    const { encryptedData } = req.body;
    const { order_id, payment_id, signature } = JSON.parse(decryptData(encryptedData)); 
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
        .update(order_id + "|" + payment_id)
        .digest('hex');

    if (generatedSignature === signature) {
        try {
            const order = await Order.findOne({ payment_id: order_id });
            if (order) {
                order.payment_status = 'Paid';
                await order.save();
                res.status(200).json({ success: true, message: 'Payment verified successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Order not found' });
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            res.status(500).json({ success: false, error: 'Failed to verify payment' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Invalid signature' });
    }
};


export const myOrders = async (req, res) => {
    const userId = req.user.id;
    const orders = await Order.find({
      customer: userId,
      $or: [
        { payment_method: { $ne: 'Razorpay' } }, // Include all orders except Razorpay
        { payment_method: 'Razorpay', 
          payment_status: { $ne: 'Pending' } } // Include Razorpay orders only if payment_status is not Pending
      ]
    }).populate('items.product').populate('shipping_address');
    const encryptedResponse = encryptData(JSON.stringify(orders));
    res.status(200).json({ success: true, data: encryptedResponse });
}

export const cancelOrder = async (req, res) => {
  const { orderId } = req.body;
  const id = JSON.parse(decryptData(orderId));
  
  try {
      const order = await Order.findById(id);
      if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Check if the order can be cancelled
      if (order.status[order.status.length - 1].status === 'Delivered') {
          return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
      }

      // Call the method to handle cancellation and refund
      await order.cancelOrder();

      res.status(200).json({ success: true, message: 'Order cancelled and refund initiated' });
  } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const bestSellers = async (req, res) => { 
  try {
    const bestSellingProducts = await Order.aggregate([
      // Filter orders to include only those with a 'Delivered' status
      {
        $match: { "status.status": "Delivered" }
      },
      // Unwind the items array to process each product separately
      { $unwind: '$items' },
      // Group by product ID and calculate the total quantity sold
      {
        $group: {
          _id: '$items.product', // Group by product ID
          totalSold: { $sum: '$items.quantity' }, // Sum the quantities sold
        },
      },
      // Lookup the product details from the products collection
      {
        $lookup: {
          from: 'products', // The name of your products collection
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      // Unwind the product details array
      {
        $unwind: '$productDetails',
      },
      // Calculate the score based on totalSold / price
      {
        $addFields: {
          score: { $divide: ['$totalSold', '$productDetails.price'] },
        },
      },
      // Sort by the score in descending order to get the best sellers
      { $sort: { score: -1 } },
      // Project the necessary fields in the output
      {
        $project: {
          _id: 0, // Exclude the _id field
          productId: '$_id',
          totalSold: 1,
          productDetails: 1, // Include all fields from productDetails
          score: 1 // Include the calculated score
        }
      },
      // Limit the results to the top 10 best-selling products
      { $limit: 10 }
    ]);

    // Send the response
    const encryptedResponse = encryptData(JSON.stringify(bestSellingProducts));
    res.json({ success: true, data: encryptedResponse });
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch best sellers' });
  }
};

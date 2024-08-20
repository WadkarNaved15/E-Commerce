// paymentRouter.js

import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

const stripe = Stripe('your-stripe-secret-key'); // Replace with your actual Stripe secret key

// Endpoint to create a PaymentIntent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body; // Amount in paise

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr', // INR currency
      payment_method_types: ['card', 'google_pay', 'apple_pay'], // Supported payment methods
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;

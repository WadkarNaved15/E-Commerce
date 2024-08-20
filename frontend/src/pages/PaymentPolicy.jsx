import React from 'react'
import "../styles/ServicePage.css"

const PaymentPolicy = () => {
  return (
    <div className="payment-policy">
      <h3>Payment Policy</h3>
      <div className="payment-policy-content">
        <p>Payment Policy for E-Commerce Store</p>
        <p>Last updated: 01/01/2024</p>
        <ul>
          <li>Overview</li>
          <p>Thank you for choosing NAME. This Payment Policy describes the terms and conditions for using our payment service.</p>
          <li>Payment Methods</li>
          <p>We accept the following payment methods:</p>
            <li className='option-list'>Credit Cards (Visa, MasterCard, American Express)</li>
            <li className='option-list'>Debit Cards</li>
            <li className='option-list'>Net Banking</li>
            <li className='option-list'>Wallets</li>
            <li className='option-list'>UPI (Unified Payments Interface)</li>
         <li>Payment Security:</li>
            <p>Rest assured, our payment security measures are of the highest standards to prevent any technical issues or mishaps.</p>
        <li>Cash on Delivery (COD) and Online Payment:</li>
            <p> You have the option to choose between Cash on Delivery or online payment for your orders.</p>
        <li>Razorpay Integration:</li>
            <p>Razorpay is our trusted payment partner, ensuring seamless and secure transactions for all your purchases.</p>
        <li>Failed Transaction Recovery:</li>
            <p> In the rare event of a failed transaction where your order is not confirmed despite payment, your amount will be refunded within 24 hours.</p>
        <li>Contact Information:</li>
        <p>For any payment-related queries or concerns, please reach out to our dedicated Customer Support team:</p>
        <li className="option-list">bfejfbhje@gmail.com</li>
        <li className="option-list">9672727327</li>
        </ul>
    </div>
    </div>
  )
}

export default PaymentPolicy
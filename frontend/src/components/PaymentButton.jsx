import React, { useState } from 'react';
import axios from 'axios';

// Helper function to load the Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const PaymentButton = ({ amount, courseName, onSuccess, disabled }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    const res = await loadRazorpayScript();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const orderResponse = await axios.post('http://localhost:5000/api/create-order', {
        amount: amount * 100, // converting ₹ to paise
      });

      const orderData = orderResponse.data;

      // 2. Setup Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use env var safely in frontend
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'skriibe',
        description: courseName || 'Payment',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyResponse = await axios.post('http://localhost:5000/api/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              // 4. Trigger success callback
              if (onSuccess) {
                onSuccess(response.razorpay_payment_id);
              }
            } else {
              alert('Payment verification failed!');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Payment verification error.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          address: 'skriibe Corporate Office',
        },
        theme: {
          color: '#10b981',
        },
      };

      const paymentObject = new window.Razorpay(options);

      // Handle payment failure gracefully
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment Failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      paymentObject.open();
    } catch (error) {
      console.error('Error in payment flow:', error);
      alert('Could not initiate payment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      style={{
        background: 'linear-gradient(90deg, #34d399, #10b981)',
        color: '#000',
        border: 'none',
        borderRadius: '16px',
        padding: '16px',
        fontWeight: '700',
        fontSize: '16px',
        width: '100%',
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.4 : 1,
        boxShadow: (disabled || loading) ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.2)',
      }}
    >
      {loading ? 'Processing...' : `Pay ₹${amount} — UPI / Card`}
    </button>
  );
};

export default PaymentButton;

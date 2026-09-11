import React, { useState } from 'react';
import api from '../services/api';

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

const PaymentButton = ({ amount, courseName, onSuccess, disabled, buyerName = '', buyerEmail = '', buyerPhone = '' }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    const res = await loadRazorpayScript();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      setLoading(true);
      
      const { data: order } = await api.post('/create-order', {
        amount: amount * 100, // amount in paise
      });

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Skriibe",
        description: courseName,
        order_id: order.id,
        prefill: {
          name: buyerName,
          email: buyerEmail,
          contact: buyerPhone,
        },
        theme: {
          color: "#10b981",
        },
        handler: async function (response) {
          try {
            const { data: verifyData } = await api.post('/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) {
              if (onSuccess) {
                onSuccess(response.razorpay_payment_id);
              }
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      paymentObject.open();

    } catch (error) {
      console.error('Error in payment flow:', error);
      alert(`Could not initiate payment: ${error.message || 'Please try again later'}`);
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

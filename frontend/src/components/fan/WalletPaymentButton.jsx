import React, { useState } from 'react';
import api from '../../services/api'; // Use custom API client
import { useAuth } from '../../context/AuthContext';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const WalletPaymentButton = ({ amount, onSuccess, disabled, customStyle, customText }) => {
  const [loading, setLoading] = useState(false);
  const { authData } = useAuth(); // to get token

  const handlePayment = async () => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your connection.');
        setLoading(false);
        return;
      }

      // Create order from backend
      const { data: orderData } = await api.post('/wallet/topup', { amount });

      if (!orderData.success) {
        alert('Could not initiate top-up.');
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100, // amount in paise
        currency: orderData.currency,
        name: 'Skriibe',
        description: 'Wallet Top-up',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await api.post('/wallet/verify-topup', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount 
            });

            if (verifyResponse.data.success) {
              setLoading('paid'); // Show "Paid" state
              setTimeout(() => {
                if (onSuccess) onSuccess(verifyResponse.data.balance);
              }, 1000);
            } else {
              alert('Payment verification failed!');
            }
          } catch (err) {
            console.error('Verify error', err);
            alert('Error verifying payment');
          } finally {
            if (loading !== 'paid') setLoading(false);
          }
        },
        theme: {
          color: '#3BA8D8'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        alert(response.error.description);
        setLoading(false);
      });
      rzp1.open();

    } catch (error) {
      console.error('Error in topup flow:', error);
      alert('Could not initiate top-up.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      style={customStyle || {
        background: 'linear-gradient(90deg, #3BA8D8, #1a6a9a)',
        color: '#fff',
        border: 'none',
        borderRadius: '16px',
        padding: '16px',
        fontWeight: '700',
        fontSize: '16px',
        width: '100%',
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.4 : 1,
        boxShadow: (disabled || loading) ? 'none' : '0 4px 14px rgba(59, 168, 216, 0.2)',
      }}
    >
      {loading === 'paid' ? 'Paid' : (loading ? 'Processing...' : (customText || `Add ₹${amount} via Razorpay`))}
    </button>
  );
};

export default WalletPaymentButton;

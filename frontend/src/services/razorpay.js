/**
 * Mock Razorpay Service
 */
export const initializeRazorpayPayment = async (amount, currency = 'INR') => {
  return new Promise((resolve) => {
    console.log(`[Mock Razorpay] Initializing payment for ${amount} ${currency}`);
    
    // Simulate API delay
    setTimeout(() => {
      resolve({
        id: `pay_${Math.random().toString(36).substr(2, 9)}`,
        status: 'created',
        amount: amount * 100,
        currency: currency
      });
    }, 1000);
  });
};

export const verifyPayment = async (paymentId) => {
  return new Promise((resolve) => {
    console.log(`[Mock Razorpay] Verifying payment ${paymentId}`);
    
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Payment verified successfully'
      });
    }, 800);
  });
};

require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

razorpay.orders.create({
  amount: 50000,
  currency: 'INR',
  receipt: 'test_receipt'
}).then(order => {
  console.log("Success! Keys are working. Order:", order);
}).catch(err => {
  console.error("Error! Keys are invalid:", err);
});

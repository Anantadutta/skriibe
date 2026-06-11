const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_T02BJvURBsdl0X',
  key_secret: '323mMUH3DVqAytOf0p8JEWFZ',
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

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/skriibe').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String, walletBalance: Number, handle: String }, { strict: false }));
  const user = await User.findOne({$or: [{name: /savantest/i}, {email: /savantest/i}, {handle: /savantest/i}]});
  console.log('SAVANTEST_USER:', user);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

const mongoose = require('mongoose');
const Fan = require('./backend/models/Fan');

mongoose.connect('mongodb://127.0.0.1:27017/skriibe', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const fan = await Fan.findOne({ email: 'duttananta@gmail.com' });
    console.log(fan);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

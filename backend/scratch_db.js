const mongoose = require('mongoose');
const Creator = require('../backend/models/Creator');

mongoose.connect('mongodb://127.0.0.1:27017/skriibe', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const creators = await Creator.find({});
    console.log(creators.map(c => ({
      name: c.name,
      handle: c.handle,
      avatarUrl: c.avatarUrl
    })));
    process.exit(0);
  });

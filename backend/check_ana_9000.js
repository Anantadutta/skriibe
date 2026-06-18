const mongoose = require('mongoose');
const Creator = require('./models/Creator');

async function check() {
  await mongoose.connect('mongodb+srv://skriibe:P8Rj8LwI6GgB6w6a@cluster0.v8v6x.mongodb.net/skriibe?retryWrites=true&w=majority');
  const creator = await Creator.findOne({ handle: /ana_9000/i });
  console.log("CREATOR:", JSON.stringify(creator, null, 2));
  process.exit(0);
}

check();

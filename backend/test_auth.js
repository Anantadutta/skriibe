const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { creatorId: '60d5ec49f1b2c8a14b8f0001', phone: '1234567890' },
  'secret'
);

const decoded = jwt.verify(token, 'secret');
console.log('Decoded:', decoded);

let creator = {
  _id: '60d5ec49f1b2c8a14b8f0001',
  phone: '1234567890',
  name: 'Test Creator',
  authProvider: 'local'
};

const creatorEmail = creator && creator.email ? creator.email.toLowerCase() : (creator && creator.phone ? `${creator.phone}@temp.skriibe.com` : null);

console.log('creatorEmail generated:', creatorEmail);

let fan = null;

if (!fan && creator && creatorEmail) {
  fan = {
    email: creatorEmail,
    password: 'auto-generated',
    name: creator.name || 'User',
    roles: ['fan', 'creator'],
    activeRole: 'fan',
    authProvider: creator.authProvider || 'local'
  };
  console.log('Fan created:', fan);
}

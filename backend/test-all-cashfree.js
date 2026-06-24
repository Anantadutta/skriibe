require('dotenv').config({ path: 'c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\backend\\.env' });

// Force production mode since the local secret is a prod secret
process.env.CASHFREE_ENV = 'production';

const { verifyBankAccount, verifyPan, verifyIfsc } = require('./utils/cashfreeService');

async function runTests() {
  console.log('--- TESTING CASHFREE API WITH RSA SIGNATURES (SANDBOX) ---\n');

  // 1. Test IFSC
  console.log('1. Testing verifyIfsc (Valid: HDFC0000001)...');
  try {
    const res = await verifyIfsc('HDFC0000001');
    console.log('[IFSC SUCCESS]', JSON.stringify(res, null, 2));
  } catch (err) {
    console.log('[IFSC ERROR]', err.response?.data || err.message);
  }

  // 2. Test PAN
  // Sandbox PANs usually accept standard formats
  console.log('\n2. Testing verifyPan (Valid format: ABCDE1234F)...');
  try {
    const res = await verifyPan({ pan: 'ABCDE1234F', name: 'John Doe' });
    console.log('[PAN SUCCESS]', JSON.stringify(res, null, 2));
  } catch (err) {
    console.log('[PAN ERROR]', err.response?.data || err.message);
  }

  // 3. Test Bank Account
  // Sandbox bank accounts usually accept standard formats
  console.log('\n3. Testing verifyBankAccount...');
  try {
    const res = await verifyBankAccount({ 
      bank_account: '1234567890', 
      ifsc: 'HDFC0000001', 
      name: 'John Doe', 
      phone: '9999999999' 
    });
    console.log('[BANK SUCCESS]', JSON.stringify(res, null, 2));
  } catch (err) {
    console.log('[BANK ERROR]', err.response?.data || err.message);
  }
}

runTests();

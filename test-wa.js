require('dotenv').config({ path: './backend/.env' });
const { sendTestMessage } = require('./backend/lib/whatsapp');

// EDIT THIS NUMBER BEFORE RUNNING
// Format: international digits, NO "+", e.g., 919876543210
const TEST_NUMBER = '918360081051';

async function runTest() {
  console.log(`Starting WhatsApp API test for number: ${TEST_NUMBER}`);
  console.log('Sending "hello_world" template...');
  
  const result = await sendTestMessage(TEST_NUMBER);
  
  if (result && result.messages) {
    console.log('SUCCESS: Message sent successfully!');
  } else if (result && result.error) {
    console.log('FAILED: Message sending failed. Check the error object above.');
  } else {
    console.log('UNKNOWN: Received an unexpected response format.');
  }
}

runTest();

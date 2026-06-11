const getHeaders = () => {
  if (!process.env.WA_ACCESS_TOKEN) {
    console.warn('WARNING: WA_ACCESS_TOKEN is not set in environment variables');
  }
  return {
    'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };
};

const getApiUrl = () => {
  if (!process.env.WA_PHONE_NUMBER_ID) {
    console.warn('WARNING: WA_PHONE_NUMBER_ID is not set in environment variables');
  }
  return `https://graph.facebook.com/v21.0/${process.env.WA_PHONE_NUMBER_ID}/messages`;
};

/**
 * Sends a test hello_world message.
 * @param {string} toNumber - international digits, NO "+"
 */
const sendTestMessage = async (toNumber) => {
  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      })
    });

    const data = await response.json();
    console.log('[WhatsApp API Test] Response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('[WhatsApp API Test] Error object found in response:', data.error);
    }
    
    return data;
  } catch (error) {
    console.error('[WhatsApp API Test] Fetch failed:', error);
    // Don't throw to crash caller
  }
};

/**
 * Sends a notification to the fan when a creator replies.
 * @param {Object} params
 * @param {string} params.fanPhone - Fan's WhatsApp number (digits only)
 * @param {string} params.fanName - Fan's name
 * @param {string} params.creatorName - Creator's name
 * @param {string} params.snippet - Snippet of the reply
 * @param {string} params.replyUrl - Link to the message/reply page
 */
const sendCreatorReplyNotification = async ({ fanPhone, fanName, creatorName, snippet, replyUrl }) => {
  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: fanPhone,
        type: 'template',
        template: {
          name: 'creator_reply_notification',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: fanName || 'Fan' },
                { type: 'text', text: creatorName || 'A creator' },
                { type: 'text', text: snippet || '' },
                { type: 'text', text: replyUrl || '' }
              ]
            }
          ]
        }
      })
    });

    const data = await response.json();
    console.log('[WhatsApp API Reply Notification] Response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('[WhatsApp API Reply Notification] Error object found in response:', data.error);
    }

    return data;
  } catch (error) {
    console.error('[WhatsApp API Reply Notification] Fetch failed:', error);
    // Don't throw to crash caller
  }
};

module.exports = {
  sendTestMessage,
  sendCreatorReplyNotification
};
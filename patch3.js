const fs = require('fs');
let content = fs.readFileSync('backend/utils/socketHandlers.js', 'utf8');

const regex = /async function startWalletDeductionTimer[\s\S]*?return; \/\/ Skip the interval completely for free chats\s*\}/;

const replacement = `async function startWalletDeductionTimer(sessionId, io) {
    console.log('Starting wallet deduction timer for session: ' + sessionId);
    
    // Clear any existing timer to prevent duplicates/orphans
    if (activeChatTimers.has(sessionId)) {
      const existingTimer = activeChatTimers.get(sessionId);
      clearTimeout(existingTimer);
      clearInterval(existingTimer);
      activeChatTimers.delete(sessionId);
    }

    const initSession = await ChatSession.findById(sessionId);
    if (initSession && initSession.isFreeChat) {
      const elapsedMs = initSession.startTime ? Date.now() - initSession.startTime.getTime() : 0;
      const remainingFreeMs = Math.max(0, 120000 - elapsedMs);

      console.log('Setting timeout for free chat ' + sessionId + ' remaining ms: ' + remainingFreeMs);
      const timeout = setTimeout(async () => {
        console.log('Free chat session ' + sessionId + ' reached 2 minute limit, checking wallet...');
        const fan = await Fan.findById(initSession.fanId);
        if (fan && fan.walletBalance > 0) {
          console.log('Fan has balance ' + fan.walletBalance + ', transitioning free chat to paid for session ' + sessionId);
          const currentSession = await ChatSession.findById(sessionId);
          currentSession.isFreeChat = false;
          currentSession.startTime = new Date();
          await currentSession.save();
          activeChatTimers.delete(sessionId);
          io.to(sessionId.toString()).emit('chat_transitioned_to_paid', { startTime: currentSession.startTime });
          startWalletDeductionTimer(sessionId, io);
        } else {
          console.log('Ending free chat session ' + sessionId);
          await endChatSession(sessionId, io, 'FREE_TRIAL_ENDED');
          activeChatTimers.delete(sessionId);
        }
      }, remainingFreeMs);
      activeChatTimers.set(sessionId, timeout);
      return; // Skip the interval completely for free chats
    }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('backend/utils/socketHandlers.js', content);
  console.log('Successfully patched socketHandlers.js!');
} else {
  console.log('Regex did not match anything!');
}

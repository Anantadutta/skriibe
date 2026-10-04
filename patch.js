const fs = require('fs');
let content = fs.readFileSync('backend/utils/socketHandlers.js', 'utf8');

const target = `  async function startWalletDeductionTimer(sessionId, io) {
    console.log(\`Starting wallet deduction timer for session: \${sessionId}\`);
    
    // Check if it's a free chat first
    const initSession = await ChatSession.findById(sessionId);
    if (initSession && initSession.isFreeChat) {
      console.log(\`Setting 2-minute strict timeout for free chat \${sessionId}\`);
      const timeout = setTimeout(async () => {
        console.log(\`Free chat session \${sessionId} reached 2 minute limit, ending automatically.\`);
        await endChatSession(sessionId, io, 'FREE_TRIAL_ENDED');
        activeChatTimers.delete(sessionId);
      }, 120000); // exactly 2 minutes
      activeChatTimers.set(sessionId, timeout);
      return; // Skip the interval completely for free chats
    }`;

const replacement = `  async function startWalletDeductionTimer(sessionId, io) {
    console.log(\`Starting wallet deduction timer for session: \${sessionId}\`);

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
      console.log(\`Setting timeout for free chat \${sessionId}\`);
      const timeout = setTimeout(async () => {
        const fan = await Fan.findById(initSession.fanId);
        if (fan && fan.walletBalance > 0) {
          const currentSession = await ChatSession.findById(sessionId);
          currentSession.isFreeChat = false;
          currentSession.startTime = new Date();
          await currentSession.save();
          activeChatTimers.delete(sessionId);
          io.to(sessionId.toString()).emit('chat_transitioned_to_paid', { startTime: currentSession.startTime });
          startWalletDeductionTimer(sessionId, io);
        } else {
          await endChatSession(sessionId, io, 'FREE_TRIAL_ENDED');
          activeChatTimers.delete(sessionId);
        }
      }, remainingFreeMs);
      activeChatTimers.set(sessionId, timeout);
      return; // Skip the interval completely for free chats
    }`;

content = content.replace(target, replacement);
fs.writeFileSync('backend/utils/socketHandlers.js', content);
console.log('Patched backend/utils/socketHandlers.js');

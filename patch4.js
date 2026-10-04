const fs = require('fs');
let content = fs.readFileSync('backend/routes/chat.js', 'utf8');
content = content.replace(/\.populate\(\\'creatorId\\', \\'name handle avatarUrl isLive manualLiveOverride manualLiveOverrideUpdatedAt suspensionUntil liveChatTimeSlots liveChatPrice\\'\)/g, 
  ".populate('creatorId', 'name handle avatarUrl isLive manualLiveOverride manualLiveOverrideUpdatedAt suspensionUntil liveChatTimeSlots liveChatPrice')");
fs.writeFileSync('backend/routes/chat.js', content);

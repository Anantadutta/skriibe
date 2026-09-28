const getIstDate = (date) => {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (330 * 60000));
};

const getMostRecentScheduledStartTime = (slots, now) => {
  if (!slots || slots.length === 0) return null;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const nowIst = getIstDate(now);
  const currentTotalMins = nowIst.getHours() * 60 + nowIst.getMinutes();
  const currentDayIdx = nowIst.getDay();

  let mostRecent = null;

  // Look back up to 7 days
  for (let lookback = 0; lookback < 7; lookback++) {
    const checkDayIdx = (currentDayIdx - lookback + 7) % 7;
    const checkDayName = days[checkDayIdx];
    
    // Find all start times for this day
    const dayStartMins = [];
    for (const slot of slots) {
      const [day, timeRange] = slot.split('|');
      if (day === checkDayName) {
        const [from] = timeRange.split('-');
        const [fromH, fromM] = from.split(':').map(Number);
        dayStartMins.push(fromH * 60 + fromM);
      }
    }

    dayStartMins.sort((a, b) => b - a); // Descending

    for (const startMin of dayStartMins) {
      if (lookback === 0 && startMin > currentTotalMins) {
        continue; // This start time is in the future (later today)
      }
      
      // Calculate actual Date of this start time
      const resultDate = new Date(nowIst);
      resultDate.setDate(resultDate.getDate() - lookback);
      resultDate.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
      
      // Convert IST back to UTC
      const resultUtc = new Date(resultDate.getTime() - (330 * 60000));
      return resultUtc;
    }
  }

  return null;
};

const isCurrentlyScheduled = (slots, now) => {
  if (!slots || slots.length === 0) return true;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const nowIst = getIstDate(now);
  const currentDay = days[nowIst.getDay()];
  const currentTotalMins = nowIst.getHours() * 60 + nowIst.getMinutes();

  for (const slot of slots) {
    const [day, timeRange] = slot.split('|');
    if (day === currentDay) {
      const [from, to] = timeRange.split('-');
      const [fromH, fromM] = from.split(':').map(Number);
      const [toH, toM] = to.split(':').map(Number);
      const fromTotal = fromH * 60 + fromM;
      const toTotal = toH * 60 + toM;

      if (currentTotalMins >= fromTotal && currentTotalMins < toTotal) {
        return true;
      }
    }
  }
  return false;
};

const calculateLiveStatus = (creator) => {
  const now = new Date();
  
  // if suspended, always false
  if (creator.suspensionUntil && new Date() < new Date(creator.suspensionUntil)) {
    return false;
  }

  const scheduledLive = isCurrentlyScheduled(creator.liveChatTimeSlots, now);

  if (creator.manualLiveOverride && creator.manualLiveOverrideUpdatedAt) {
    const overrideDate = new Date(creator.manualLiveOverrideUpdatedAt);
    
    // Check if 24 hours have passed
    if (now.getTime() - overrideDate.getTime() > 24 * 60 * 60 * 1000) {
      return scheduledLive;
    }

    // Check if an OFFLINE->ONLINE transition happened since override
    const mostRecentStart = getMostRecentScheduledStartTime(creator.liveChatTimeSlots, now);
    if (mostRecentStart && mostRecentStart > overrideDate) {
      return scheduledLive;
    }

    // Override is still active
    return creator.manualLiveOverride === 'online';
  }

  return scheduledLive;
};

module.exports = {
  calculateLiveStatus
};

/**
 * Checks if the current local time falls within any of the provided time slots.
 * @param {Array<string>} timeSlots - Array of time strings, e.g. ["10:00-12:00", "14:00-16:00"]
 * @returns {boolean} True if currently live
 */
export const checkIfLiveNow = (timeSlots) => {
  if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
    return false; // No slots means offline
  }

  const now = new Date();
  
  // Bulletproof IST calculation using pure UTC math (IST is UTC+5:30)
  const istMillis = now.getTime() + (5.5 * 3600000);
  const istDate = new Date(istMillis);
  
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayStr = daysMap[istDate.getUTCDay()];
  
  const currentHours = istDate.getUTCHours();
  const currentMinutes = istDate.getUTCMinutes();

  // Convert current time to a numeric value (e.g. 10:30 -> 10.5)
  const currentTime = currentHours + (currentMinutes / 60);

  for (const slot of timeSlots) {
    try {
      let timeRange = slot;
      let slotDay = null;
      if (slot.includes('|')) {
        const parts = slot.split('|');
        slotDay = parts[0];
        timeRange = parts[1];
      }
      
      // If slot specifies a day, require it to match today
      if (slotDay && slotDay !== currentDayStr) {
        continue;
      }

      const [startStr, endStr] = timeRange.split('-');
      if (!startStr || !endStr) continue;

      const [startH, startM] = startStr.split(':').map(Number);
      const [endH, endM] = endStr.split(':').map(Number);

      const startTime = startH + (startM / 60);
      let endTime = endH + (endM / 60);

      // Handle midnight wrap-around (e.g. 22:00-02:00)
      if (endTime < startTime) {
        // If current time is after start time (e.g. 23:00) OR before end time (e.g. 01:00)
        if (currentTime >= startTime || currentTime < endTime) {
          return true;
        }
      } else {
        // Normal case (e.g. 10:00-12:00)
        if (currentTime >= startTime && currentTime < endTime) {
          return true;
        }
      }
    } catch (err) {
      console.warn("Failed to parse time slot:", slot, err);
    }
  }

  return false;
};

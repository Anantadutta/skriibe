/**
 * Sorts an array of messages strictly by their sentAt timestamp.
 * This guarantees chronological ordering regardless of network delay or out-of-order arrival.
 * 
 * @param {Array} messages - The list of messages to sort.
 * @returns {Array} - The sorted list of messages.
 */
export const sortMessagesByTimestamp = (messages) => {
  if (!messages || !Array.isArray(messages)) return [];
  
  return [...messages].sort((a, b) => {
    // If sentAt is missing (e.g. optimistic UI), fallback to timestamp or current time
    const timeA = new Date(a.sentAt || a.timestamp || Date.now()).getTime();
    const timeB = new Date(b.sentAt || b.timestamp || Date.now()).getTime();
    
    return timeA - timeB;
  });
};

/**
 * Merges new messages into an existing message array, preventing duplicates
 * by checking messageId (or tempId for optimistic UI), and sorts them chronologically.
 * 
 * @param {Array} currentMessages - The existing messages.
 * @param {Array|Object} newMessages - The new message(s) to merge.
 * @returns {Array} - The merged and sorted message list.
 */
export const mergeAndSortMessages = (currentMessages, newMessages) => {
  const messagesToAdd = Array.isArray(newMessages) ? newMessages : [newMessages];
  let merged = [...(currentMessages || [])];

  messagesToAdd.forEach(newMsg => {
    // Check by tempId (optimistic) or messageId (persisted)
    const existingIndex = merged.findIndex(m => 
      (m.tempId && newMsg.tempId && m.tempId === newMsg.tempId) ||
      (m.messageId && newMsg.messageId && m.messageId === newMsg.messageId) ||
      (m.tempId && newMsg.messageId && m.tempId === newMsg.messageId)
    );

    if (existingIndex !== -1) {
      // Replace/update existing message
      merged[existingIndex] = { ...merged[existingIndex], ...newMsg };
    } else {
      // Append new message
      merged = [...merged, newMsg];
    }
  });

  // Force sort and return a fresh array reference
  return [...merged].sort((a, b) => {
    const timeA = new Date(a.sentAt || a.timestamp || Date.now()).getTime();
    const timeB = new Date(b.sentAt || b.timestamp || Date.now()).getTime();
    return timeA - timeB;
  });
};

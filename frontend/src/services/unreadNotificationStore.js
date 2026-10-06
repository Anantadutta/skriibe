import { useSyncExternalStore } from 'react';
import api from './api';

let unreadCount = 0;
let pollTimer = null;
let requestInFlight = false;
const subscribers = new Set();

const publish = (nextCount) => {
  if (unreadCount === nextCount) return;
  unreadCount = nextCount;
  subscribers.forEach((subscriber) => subscriber());
};

const refreshUnreadCount = async () => {
  if (requestInFlight || document.visibilityState === 'hidden') return;
  requestInFlight = true;
  try {
    const response = await api.get('/questions/unread-count');
    if (response.data?.success && Number.isFinite(response.data.count)) {
      publish(response.data.count);
    }
  } catch {
    // Keep the last known count when the API is temporarily unavailable.
  } finally {
    requestInFlight = false;
  }
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') refreshUnreadCount();
};

const handleNotificationRead = () => refreshUnreadCount();

const subscribe = (subscriber) => {
  subscribers.add(subscriber);
  if (subscribers.size === 1) {
    refreshUnreadCount();
    pollTimer = window.setInterval(refreshUnreadCount, 15000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('notificationRead', handleNotificationRead);
    window.addEventListener('skriibe:auth', handleNotificationRead);
  }

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) {
      window.clearInterval(pollTimer);
      pollTimer = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('notificationRead', handleNotificationRead);
      window.removeEventListener('skriibe:auth', handleNotificationRead);
    }
  };
};

const subscribeDisabled = () => () => {};
const getSnapshot = () => unreadCount;

export const useUnreadNotificationCount = (enabled = true) =>
  useSyncExternalStore(enabled ? subscribe : subscribeDisabled, getSnapshot, getSnapshot);

// Order notification utilities

import React from 'react';

export interface OrderNotification {
  id: string;
  orderId: string;
  type: 'status_update' | 'ready_pickup' | 'out_delivery' | 'delivered' | 'cancelled';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: OrderNotification[] = [];
  private listeners: ((notification: OrderNotification) => void)[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Load notifications from localStorage
      this.loadFromStorage();
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Add a listener for new notifications
  subscribe(callback: (notification: OrderNotification) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners
  private notify(notification: OrderNotification) {
    this.listeners.forEach(callback => callback(notification));

    // Browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        tag: notification.orderId,
      });
    }
  }

  // Add a new notification
  addNotification(notification: Omit<OrderNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: OrderNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage();
    this.notify(newNotification);

    return newNotification;
  }

  // Get all notifications
  getNotifications(): OrderNotification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): OrderNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.saveToStorage();
  }

  // Save to localStorage
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderNotifications', JSON.stringify(this.notifications));
    }
  }

  // Load from localStorage
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('orderNotifications');
      if (stored) {
        try {
          this.notifications = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse notifications from storage', e);
        }
      }
    }
  }

  // Order status change notifications
  notifyStatusChange(orderId: string, status: string) {
    const messages: Record<string, { title: string; message: string; type: OrderNotification['type'] }> = {
      confirmed: {
        title: 'Order Confirmed',
        message: `Your order ${orderId} has been confirmed and is being prepared.`,
        type: 'status_update',
      },
      preparing: {
        title: 'Order Being Prepared',
        message: `Your order ${orderId} is being prepared by the supplier.`,
        type: 'status_update',
      },
      ready: {
        title: 'Ready for Pickup',
        message: `Your order ${orderId} is ready for pickup!`,
        type: 'ready_pickup',
      },
      completed: {
        title: 'Order Completed',
        message: `Your order ${orderId} has been completed.`,
        type: 'delivered',
      },
      cancelled: {
        title: 'Order Cancelled',
        message: `Your order ${orderId} has been cancelled.`,
        type: 'cancelled',
      },
    };

    const notification = messages[status];
    if (notification) {
      this.addNotification({
        orderId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
      });
    }
  }
}

export const notificationService = NotificationService.getInstance();

// React hook for using notifications
export function useOrderNotifications() {
  const [notifications, setNotifications] = React.useState<OrderNotification[]>(
    notificationService.getNotifications()
  );

  React.useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return unsubscribe;
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead: (id: string) => {
      notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    },
    markAllAsRead: () => {
      notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    },
    clearAll: () => {
      notificationService.clearAll();
      setNotifications([]);
    },
  };
}

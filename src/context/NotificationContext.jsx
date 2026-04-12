import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    pendingOrders: 0,
    pendingAppointments: 0,
    pendingReviews: 0,
    newUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchCounts = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const { data } = await api.get('/admin/notification-counts');
      setCounts(data.counts);
      setRecentActivity(data.recent || []);
    } catch {}
  }, [user]);

  // Poll every 30 seconds
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  const totalBadge = counts.pendingOrders + counts.pendingAppointments + counts.pendingReviews;

  return (
    <NotificationContext.Provider value={{ counts, totalBadge, recentActivity, refresh: fetchCounts }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

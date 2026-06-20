"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Bell, Check, Trash2, Loader2, CheckCircle2 } from "lucide-react";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("admin-notifications-page")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) => prev.map(n => n.id === payload.new.id ? (payload.new as Notification) : n));
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
      // Realtime subscription handles state update, but we can do optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Notifications</h1>
          <p className="text-[var(--text-secondary)]">Stay updated with system alerts and new bookings.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-gray-500" />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[300px]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-black mb-1">All caught up!</h3>
              <p className="text-sm text-[var(--text-secondary)]">You have no notifications at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-6 transition-all group relative flex gap-4 ${
                    n.is_read 
                      ? 'bg-white hover:bg-gray-50/50' 
                      : 'bg-blue-50/30 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="mt-1 shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border ${
                      !n.is_read ? 'bg-blue-500 border-blue-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-500'
                    }`}>
                      <Bell className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className={`text-base font-bold ${!n.is_read ? 'text-black' : 'text-gray-800'}`}>
                          {n.title}
                        </h4>
                        <p className={`text-sm mt-1 leading-relaxed ${!n.is_read ? 'text-gray-700 font-medium' : 'text-[var(--text-secondary)]'}`}>
                          {n.message}
                        </p>
                        <span className="text-xs text-gray-400 font-semibold block mt-3">
                          {new Date(n.created_at).toLocaleDateString(undefined, { 
                            weekday: 'short', month: 'short', day: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!n.is_read && (
                          <button 
                            onClick={() => handleMarkAsRead(n.id)}
                            className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-500 hover:text-black border border-gray-200 shadow-sm transition-all"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(n.id)}
                          className="p-2 bg-white hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 border border-gray-200 shadow-sm transition-all"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

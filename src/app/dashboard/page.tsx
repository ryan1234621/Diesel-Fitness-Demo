"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  Dumbbell, 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard, 
  MapPin, 
  XCircle, 
  Eye, 
  Bell, 
  Check, 
  Trash2,
  Loader2,
  X
} from "lucide-react";
import Link from "next/link";

type Booking = {
  id: string;
  session_id: string;
  user_id: string;
  status: string;
  payment_status: string;
  cancel_reason: string | null;
  created_at: string;
  sessions: {
    id: string;
    session_type_id: string;
    start_time: string;
    end_time: string;
    max_slots: number;
    price: number;
    location: string;
    status: string;
    description: string | null;
    session_types?: {
      title: string;
      duration_minutes: number;
    } | null;
  } | null;
};

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // 1. Fetch client's bookings with nested sessions and templates
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          sessions (
            *,
            session_types (
              title,
              duration_minutes
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings((bookingsData || []) as any);

      // 2. Fetch client's notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenViewModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      // Update state locally
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b)
      );

      // Add a client notification locally
      await supabase.from("notifications").insert([
        {
          user_id: user?.id,
          title: "Booking Cancelled",
          message: "You have successfully cancelled your booking.",
          type: "cancellation",
          is_read: false
        }
      ]);

      // Refresh data
      await fetchData();
      setIsViewModalOpen(false);
      setSelectedBooking(null);
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking: " + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err: any) {
      console.error("Error deleting notification:", err);
    }
  };

  // Metrics calculations
  const now = new Date();

  const upcomingSessionsCount = bookings.filter(b => {
    if (b.status === "cancelled" || !b.sessions?.start_time) return false;
    return new Date(b.sessions.start_time) > now;
  }).length;

  const completedSessionsCount = bookings.filter(b => {
    if (b.status === "cancelled" || !b.sessions?.start_time) return false;
    return b.status === "completed" || new Date(b.sessions.start_time) < now;
  }).length;

  const totalPayments = bookings
    .filter(b => b.payment_status === "paid" && b.status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.sessions?.price || 0), 0);

  // Find next upcoming session
  const nextSession = bookings
    .filter(b => {
      if (b.status === "cancelled" || b.status === "completed" || !b.sessions?.start_time) return false;
      return new Date(b.sessions.start_time) > now;
    })
    .sort((a, b) => {
      return new Date(a.sessions!.start_time).getTime() - new Date(b.sessions!.start_time).getTime();
    })[0] || null;

  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2 text-black">
          Welcome back, {profile?.full_name || user?.email?.split("@")[0] || "Client"}!
        </h1>
        <p className="text-[var(--text-secondary)]">Here is your dynamic training dashboard and metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Next Session Card */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white/50 hover:shadow-md transition-shadow relative overflow-hidden md:col-span-2">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-transparent blur-2xl opacity-55"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Next Session</p>
              {nextSession ? (
                <div>
                  <h3 className="text-xl font-black text-black mb-1">{nextSession.sessions?.session_types?.title}</h3>
                  <div className="flex flex-col gap-1 text-sm text-[var(--text-secondary)] mt-2">
                    <span className="flex items-center gap-1.5 font-semibold text-black">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      {new Date(nextSession.sessions!.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(nextSession.sessions!.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({nextSession.sessions?.session_types?.duration_minutes} mins)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {nextSession.sessions?.location}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleOpenViewModal(nextSession)}
                    className="mt-4 flex items-center gap-1.5 text-xs font-black uppercase text-black hover:text-gray-600 transition-colors"
                  >
                    View details <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-gray-400 mb-1">No scheduled sessions</h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-4">Book your next training session today!</p>
                  <Link 
                    href="/dashboard/bookings/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all"
                  >
                    Book Now
                  </Link>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Stats: Upcoming Workouts */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white/50 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Upcoming</p>
            <div className="w-10 h-10 bg-[#F4F3EF] rounded-full flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
          </div>
          <p className="text-3xl font-black text-black">{upcomingSessionsCount}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Booked workouts</p>
        </div>

        {/* Stats: Total Payments */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white/50 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Paid</p>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-green-700">£{totalPayments.toFixed(2)}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">In-person payments made</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bookings Feed */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm p-6 md:p-8 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-black">Your Bookings</h2>
            <Link 
              href="/dashboard/bookings/new"
              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              Book New Session
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold mb-1">No bookings found</h3>
              <p className="text-xs text-[var(--text-secondary)]">You haven't scheduled any sessions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 px-4 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Session</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Date & Time</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Payment</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Status</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {bookings.map((booking) => {
                    const start = booking.sessions?.start_time ? new Date(booking.sessions.start_time) : null;
                    return (
                      <tr 
                        key={booking.id}
                        onClick={() => handleOpenViewModal(booking)}
                        className="hover:bg-white/60 transition-all duration-200 group cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <span className="font-bold text-sm text-black">{booking.sessions?.session_types?.title || "Unknown Class"}</span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-gray-700">
                          {start ? (
                            <div>
                              <div>{start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                              <div className="text-[10px] text-gray-450 mt-0.5">{start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          ) : (
                            "Not Scheduled"
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${
                            booking.payment_status === 'paid' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                          }`}>
                            {booking.payment_status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${
                            booking.status === 'confirmed' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                            booking.status === 'cancelled' ? 'bg-red-50 border-red-100 text-red-700' :
                            'bg-gray-50 border-gray-100 text-gray-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleOpenViewModal(booking)}
                            className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-white shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notifications Widget */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notifications
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-full shrink-0">
                  {unreadNotificationsCount}
                </span>
              )}
            </h2>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-[var(--text-secondary)]">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3 rounded-2xl border transition-all relative group flex flex-col gap-1 ${
                    n.is_read 
                      ? 'bg-white border-gray-100' 
                      : 'bg-gradient-to-br from-white to-gray-50 border-black/10 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-bold text-xs text-black flex items-center gap-1.5">
                      {!n.is_read && <span className="w-1.5 h-1.5 bg-black rounded-full"></span>}
                      {n.title}
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.is_read && (
                        <button 
                          onClick={() => handleMarkAsRead(n.id)}
                          className="p-1 bg-white hover:bg-gray-100 rounded-full text-gray-500 hover:text-black border border-gray-150 shadow-sm transition-all"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteNotification(n.id)}
                        className="p-1 bg-white hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 border border-gray-150 shadow-sm transition-all"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-gray-400 font-semibold self-start mt-1">
                    {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Booking Detail Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-white/20 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <button 
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedBooking(null);
              }}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-black mb-1">Booking Details</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mt-2 ${
                selectedBooking.status === 'confirmed' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                selectedBooking.status === 'cancelled' ? 'bg-red-50 border-red-100 text-red-700' :
                'bg-gray-50 border-gray-100 text-gray-700'
              }`}>
                {selectedBooking.status}
              </span>
            </div>

            <div className="space-y-6">
              {/* Session Info */}
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Session</h3>
                <div className="font-black text-xl text-black">{selectedBooking.sessions?.session_types?.title}</div>
              </div>

              {/* Description */}
              {selectedBooking.sessions?.description && (
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Details</h3>
                  <p className="text-sm text-gray-750 font-medium leading-relaxed">{selectedBooking.sessions.description}</p>
                </div>
              )}

              {/* Schedule and Location */}
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Schedule & Location</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedBooking.sessions?.start_time && (
                    <>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        {new Date(selectedBooking.sessions.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        {new Date(selectedBooking.sessions.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{selectedBooking.sessions?.location || "On Premises"}</span>
                  </div>
                  {selectedBooking.sessions?.session_types?.duration_minutes && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{selectedBooking.sessions.session_types.duration_minutes} mins</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price</h3>
                  <div className="font-black text-lg text-black">
                    £{Number(selectedBooking.sessions?.price || 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment</h3>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wide border mt-1 ${
                    selectedBooking.payment_status === 'paid' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-yellow-100 border-yellow-200 text-yellow-800'
                  }`}>
                    {selectedBooking.payment_status}
                  </span>
                </div>
              </div>

              {/* Quick Actions (Cancel Booking) */}
              {selectedBooking.status !== "cancelled" && selectedBooking.sessions?.start_time && new Date(selectedBooking.sessions.start_time) > now && (
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    disabled={cancelling}
                    className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all text-sm shadow-sm disabled:opacity-50"
                  >
                    {cancelling ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <XCircle className="w-4.5 h-4.5" />
                    )}
                    Cancel Booking
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

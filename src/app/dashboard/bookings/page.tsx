"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Loader2, 
  Eye, 
  XCircle,
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

export default function ClientBookings() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
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

      if (error) throw error;
      setBookings((data || []) as any[]);
    } catch (err: any) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

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

      await fetchBookings();
      setIsModalOpen(false);
      setSelectedBooking(null);
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking: " + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter((b) => {
      if (b.status === "cancelled") {
        return activeTab === "cancelled";
      }
      
      const sessionDate = b.sessions?.start_time ? new Date(b.sessions.start_time) : null;
      const isFuture = sessionDate ? sessionDate > now : false;

      if (activeTab === "upcoming") {
        return (b.status === "pending" || b.status === "confirmed") && isFuture;
      } else if (activeTab === "past") {
        return b.status === "completed" || ((b.status === "pending" || b.status === "confirmed") && !isFuture);
      }
      return false;
    });
  };

  const filteredBookings = getFilteredBookings();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-black">My Bookings</h1>
          <p className="text-[var(--text-secondary)]">Manage your past and upcoming sessions.</p>
        </div>
        <Link 
          href="/dashboard/bookings/new"
          className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm text-sm"
        >
          New Booking
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Status Tabs */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === "upcoming" 
                  ? "bg-white text-black shadow-sm border border-gray-150" 
                  : "text-[var(--text-secondary)] hover:bg-white/50"
              }`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === "past" 
                  ? "bg-white text-black shadow-sm border border-gray-150" 
                  : "text-[var(--text-secondary)] hover:bg-white/50"
              }`}
            >
              Past
            </button>
            <button 
              onClick={() => setActiveTab("cancelled")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === "cancelled" 
                  ? "bg-white text-black shadow-sm border border-gray-150" 
                  : "text-[var(--text-secondary)] hover:bg-white/50"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center py-20">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold mb-1 text-black">No bookings found</h3>
            <p className="text-xs text-[var(--text-secondary)]">You do not have any bookings in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/20">
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Session</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Date & Time</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Location</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">Payment</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/55">
                {filteredBookings.map((booking) => {
                  const start = booking.sessions?.start_time ? new Date(booking.sessions.start_time) : null;
                  return (
                    <tr 
                      key={booking.id}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsModalOpen(true);
                      }}
                      className="hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <span className="font-bold text-sm text-black">
                          {booking.sessions?.session_types?.title || "Unknown Class"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-gray-700">
                        {start ? (
                          <div>
                            <div>{start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        ) : (
                          "Not Scheduled"
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600">
                        {booking.sessions?.location || "Main Gym"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border ${
                          booking.payment_status === 'paid' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-50 shadow-sm border border-gray-100"
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

      {/* Booking Detail Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-white/20 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <button 
              onClick={() => {
                setIsModalOpen(false);
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
              {selectedBooking.status !== "cancelled" && selectedBooking.sessions?.start_time && new Date(selectedBooking.sessions.start_time) > new Date() && (
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

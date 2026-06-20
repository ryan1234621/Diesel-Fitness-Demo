"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  CreditCard,
  User
} from "lucide-react";

type SessionType = {
  title: string;
  duration_minutes: number;
  price: number;
  location: string;
  capacity: number | null;
  description?: string | null;
};

type Session = {
  id: string;
  session_type_id: string;
  start_time: string;
  end_time: string;
  max_slots: number;
  price: number;
  location: string;
  status: string;
  description: string | null;
  session_types: SessionType | null;
  bookings: {
    id: string;
    user_id: string;
    status: string;
  }[];
};

export default function ClientNewBooking() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Date and Week states
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Set to Monday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [selectedMobileDate, setSelectedMobileDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<string>("all");

  const fetchBookingData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch upcoming scheduled sessions (limit to next 4 weeks to keep query light)
      const now = new Date().toISOString();
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select(`
          *,
          session_types (
            title,
            duration_minutes,
            price,
            location,
            capacity,
            description
          ),
          bookings (
            id,
            user_id,
            status
          )
        `)
        .eq("status", "scheduled")
        .gt("start_time", now)
        .order("start_time", { ascending: true });

      if (sessionsError) throw sessionsError;
      setSessions((sessionsData || []) as any[]);

      // 2. Fetch current user's active bookings to cross-reference
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          sessions (
            id,
            start_time,
            end_time
          )
        `)
        .eq("user_id", user.id)
        .neq("status", "cancelled");

      if (bookingsError) throw bookingsError;
      setUserBookings(bookingsData || []);

    } catch (err: any) {
      console.error("Error loading sessions:", err);
      toastError("Failed to load scheduled sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingData();
  }, [user]);

  // Navigate Weeks
  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
    // Align mobile selected date to the Monday of the new week
    setSelectedMobileDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
    // Align mobile selected date to the Monday of the new week
    setSelectedMobileDate(newDate);
  };

  // Generate the 7 days of the active week
  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getDaysOfWeek();

  // Helper to format week range label
  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    if (sameMonth && sameYear) {
      return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { day: 'numeric', year: 'numeric' })}`;
    } else if (sameYear) {
      return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Filter & Group sessions
  const getFilteredSessions = () => {
    let result = sessions;
    if (sessionFilter !== "all") {
      result = sessions.filter(s => s.session_types?.title === sessionFilter);
    }
    return result;
  };

  const filteredSessions = getFilteredSessions();

  // Get unique session type titles for filter dropdown
  const uniqueSessionTitles = Array.from(
    new Set(sessions.map(s => s.session_types?.title).filter(Boolean))
  ) as string[];

  // Helper to check if a specific session is already booked by the user
  const isSessionBooked = (sessionId: string) => {
    return userBookings.some(b => b.session_id === sessionId);
  };

  // Helper to check for time conflicts
  const getConflictBooking = (session: Session) => {
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.end_time).getTime();

    return userBookings.find(b => {
      if (!b.sessions) return false;
      const bStart = new Date(b.sessions.start_time).getTime();
      const bEnd = new Date(b.sessions.end_time).getTime();
      // Overlap logic: start_A < end_B and end_A > start_B
      return start < bEnd && end > bStart;
    });
  };

  // Book session handler
  const handleBookSession = async (session: Session) => {
    if (!user) return;
    setSubmitting(true);
    try {
      // 1. Double check capacity limits
      const activeBookings = session.bookings.filter(b => b.status !== "cancelled");
      const currentBookedCount = activeBookings.length;
      if (currentBookedCount >= session.max_slots) {
        throw new Error("This session is already fully booked.");
      }

      // 2. Double check booking conflict
      if (isSessionBooked(session.id)) {
        throw new Error("You are already booked for this session.");
      }

      // 3. Insert booking
      const { error: insertError } = await supabase
        .from("bookings")
        .insert([
          {
            session_id: session.id,
            user_id: user.id,
            status: "confirmed",
            payment_status: "unpaid"
          }
        ]);

      if (insertError) throw insertError;

      // 4. Insert notification
      const dateFormatted = new Date(session.start_time).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const notificationsPayload = [
        {
          user_id: user.id,
          title: "Session Booked Successfully",
          message: `Your booking for "${session.session_types?.title}" on ${dateFormatted} has been confirmed. Payment is due in person.`,
          type: "booking",
          is_read: false
        }
      ];

      // Notify active admins
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .eq("status", "active");

      if (admins && admins.length > 0) {
        const clientName = profile?.full_name || user.email || "A client";
        for (const admin of admins) {
          notificationsPayload.push({
            user_id: admin.id,
            title: "New Booking Received",
            message: `${clientName} has booked "${session.session_types?.title}" for ${dateFormatted}.`,
            type: "booking_created",
            is_read: false
          });
        }
      }

      await supabase.from("notifications").insert(notificationsPayload);

      success("Booking confirmed successfully!");
      setIsDrawerOpen(false);
      setSelectedSession(null);
      
      // Refresh local states
      await fetchBookingData();
      
      // Redirect to bookings list
      router.push("/dashboard/bookings");
    } catch (err: any) {
      console.error("Booking error:", err);
      toastError(err.message || "Failed to confirm booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <button 
            onClick={() => router.push("/dashboard/bookings")}
            className="flex items-center gap-1.5 text-xs font-black uppercase text-[var(--text-secondary)] hover:text-black transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
          </button>
          <h1 className="text-4xl font-black tracking-tight text-black">Book a Session</h1>
          <p className="text-[var(--text-secondary)]">Browse available times and register for your next training.</p>
        </div>

        {/* Filters and Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl font-bold text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Session Types</option>
            {uniqueSessionTitles.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>

          <div className="flex items-center bg-white border border-gray-150 rounded-xl p-1 shadow-sm">
            <button 
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-xs text-black min-w-[170px] text-center select-none">
              {formatWeekRange()}
            </span>
            <button 
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* DESKTOP CALENDAR VIEW (WEEKLY BOARD GRID) */}
          <div className="hidden md:grid grid-cols-7 gap-4 bg-white/40 p-4 rounded-3xl border border-white/50 backdrop-blur-md">
            {weekDays.map((day, idx) => {
              const daySessions = filteredSessions.filter(s => {
                const sDate = new Date(s.start_time);
                return sDate.getDate() === day.getDate() && 
                       sDate.getMonth() === day.getMonth() && 
                       sDate.getFullYear() === day.getFullYear();
              });

              const isToday = new Date().toDateString() === day.toDateString();

              return (
                <div key={idx} className="flex flex-col min-h-[450px] space-y-3">
                  {/* Day Header */}
                  <div className={`p-3 rounded-2xl text-center flex flex-col border ${
                    isToday 
                      ? 'bg-black text-white border-black shadow-sm' 
                      : 'bg-white/80 border-white/50'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                      {day.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-black mt-0.5">
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Sessions Slots */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
                    {daySessions.length === 0 ? (
                      <div className="text-[10px] font-semibold text-gray-400 text-center py-6">
                        No classes
                      </div>
                    ) : (
                      daySessions.map(session => {
                        const start = new Date(session.start_time);
                        const booked = isSessionBooked(session.id);
                        const activeBookings = session.bookings.filter(b => b.status !== "cancelled");
                        const full = activeBookings.length >= session.max_slots;
                        const conflict = !booked && getConflictBooking(session);

                        return (
                          <div 
                            key={session.id}
                            onClick={() => {
                              setSelectedSession(session);
                              setIsDrawerOpen(true);
                            }}
                            className={`p-3 rounded-2xl border text-left cursor-pointer transition-all hover:-translate-y-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md ${
                              booked 
                                ? 'bg-green-50/70 border-green-150 hover:bg-green-50' 
                                : full
                                  ? 'bg-red-50/50 border-red-100 hover:bg-red-50/70'
                                  : conflict
                                    ? 'bg-yellow-50/70 border-yellow-150 hover:bg-yellow-50'
                                    : 'bg-white border-gray-100 hover:border-black/20'
                            }`}
                          >
                            <span className="text-[9px] font-black text-gray-400 block mb-1">
                              {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <h4 className="font-bold text-xs text-black line-clamp-1">
                              {session.session_types?.title}
                            </h4>
                            
                            <div className="flex flex-col gap-1 mt-2.5 text-[9px] text-[var(--text-secondary)] font-semibold">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                {session.session_types?.duration_minutes}m
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="truncate">{session.location}</span>
                              </span>
                            </div>

                            {/* Indicators */}
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[10px] font-black text-black">
                                £{Number(session.price).toFixed(0)}
                              </span>

                              {booked ? (
                                <span className="text-[8px] font-black text-green-700 uppercase bg-green-100 px-1.5 py-0.5 rounded">
                                  Booked
                                </span>
                              ) : full ? (
                                <span className="text-[8px] font-black text-red-700 uppercase bg-red-100 px-1.5 py-0.5 rounded">
                                  Full
                                </span>
                              ) : conflict ? (
                                <span className="text-[8px] font-black text-yellow-800 uppercase bg-yellow-100 px-1.5 py-0.5 rounded" title="Time Conflict">
                                  Conflict
                                </span>
                              ) : (
                                <span className="text-[8px] font-black text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                                  {session.max_slots - activeBookings.length} left
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* MOBILE CALENDAR VIEW (HORIZONTAL DATE STRIP + TIMELINE AGENDA) */}
          <div className="md:hidden space-y-6">
            {/* Horizontal swipable dates */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
              {weekDays.map((day, idx) => {
                const isSelected = selectedMobileDate.toDateString() === day.toDateString();
                const isToday = new Date().toDateString() === day.toDateString();

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedMobileDate(day)}
                    className={`flex flex-col items-center justify-center min-w-[54px] h-16 rounded-2xl border transition-all snap-center ${
                      isSelected 
                        ? 'bg-black border-black text-white shadow-md' 
                        : 'bg-white border-gray-100 text-black hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-75">
                      {day.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className="text-base font-black mt-0.5">
                      {day.getDate()}
                    </span>
                    {isToday && !isSelected && (
                      <span className="w-1 h-1 bg-black rounded-full mt-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Agenda List for Selected Day */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
              <h3 className="text-lg font-black text-black">
                {selectedMobileDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>

              {(() => {
                const daySessions = filteredSessions.filter(s => {
                  const sDate = new Date(s.start_time);
                  return sDate.getDate() === selectedMobileDate.getDate() && 
                         sDate.getMonth() === selectedMobileDate.getMonth() && 
                         sDate.getFullYear() === selectedMobileDate.getFullYear();
                });

                if (daySessions.length === 0) {
                  return (
                    <div className="text-center py-12 text-sm text-[var(--text-secondary)] bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      No training sessions scheduled for this day.
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-gray-100">
                    {daySessions.map(session => {
                      const start = new Date(session.start_time);
                      const end = new Date(session.end_time);
                      const booked = isSessionBooked(session.id);
                      const activeBookings = session.bookings.filter(b => b.status !== "cancelled");
                      const full = activeBookings.length >= session.max_slots;
                      const conflict = !booked && getConflictBooking(session);

                      return (
                        <div 
                          key={session.id}
                          onClick={() => {
                            setSelectedSession(session);
                            setIsDrawerOpen(true);
                          }}
                          className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 cursor-pointer group"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-black">
                                {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                ({session.session_types?.duration_minutes} mins)
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-black group-hover:text-gray-600 transition-colors truncate">
                              {session.session_types?.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] font-medium">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {session.location}
                              </span>
                              <span className="font-bold text-black">
                                £{Number(session.price).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {booked ? (
                              <span className="text-[9px] font-black text-green-700 uppercase bg-green-50 border border-green-100 px-2 py-0.5 rounded-md">
                                Booked
                              </span>
                            ) : full ? (
                              <span className="text-[9px] font-black text-red-700 uppercase bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                                Full
                              </span>
                            ) : conflict ? (
                              <span className="text-[9px] font-black text-yellow-800 uppercase bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded-md">
                                Conflict
                              </span>
                            ) : (
                              <span className="text-[9px] font-black text-gray-500 uppercase bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                                {session.max_slots - activeBookings.length} spots
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {/* Booking Side Drawer / Slide-Over Modal */}
      {isDrawerOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            onClick={() => {
              if (!submitting) {
                setIsDrawerOpen(false);
                setSelectedSession(null);
              }
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer content panel */}
          <div className="w-full max-w-md bg-white h-full relative z-10 shadow-2xl flex flex-col justify-between border-l border-gray-100 p-8 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Session Booking</span>
                <button 
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setSelectedSession(null);
                  }}
                  disabled={submitting}
                  className="p-1.5 hover:bg-gray-150 text-gray-400 hover:text-black rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Class Title */}
                <div>
                  <h2 className="text-2xl font-black text-black mb-1">{selectedSession.session_types?.title}</h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-wide rounded-full">
                    <User className="w-3 h-3" /> Trainer Lead
                  </span>
                </div>

                {/* Description */}
                {(selectedSession.description || selectedSession.session_types?.description) && (
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-1">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">About Class</h5>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {selectedSession.description || selectedSession.session_types?.description}
                    </p>
                  </div>
                )}

                {/* Schedule & Location Card */}
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3 text-sm">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Schedule Details</h5>
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      {new Date(selectedSession.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                      {new Date(selectedSession.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({selectedSession.session_types?.duration_minutes} min)
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 pt-1 border-t border-gray-100/50">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{selectedSession.location}</span>
                  </div>
                </div>

                {/* Price & Billing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Billing Type</h5>
                    <span className="flex items-center gap-1.5 text-xs text-black font-black uppercase">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" /> Pay In Person
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Price</h5>
                    <span className="text-base font-black text-black">
                      £{Number(selectedSession.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                {(() => {
                  const activeB = selectedSession.bookings.filter(b => b.status !== "cancelled");
                  const filledCount = activeB.length;
                  const ratio = Math.min(100, (filledCount / selectedSession.max_slots) * 100);

                  return (
                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-gray-400">Class Capacity</span>
                        <span className="text-black font-bold">{filledCount} / {selectedSession.max_slots} spots filled</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${ratio >= 100 ? 'bg-red-500' : 'bg-black'}`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Conflict / Already Booked Warning Alerts */}
                {(() => {
                  const booked = isSessionBooked(selectedSession.id);
                  const activeB = selectedSession.bookings.filter(b => b.status !== "cancelled");
                  const full = activeB.length >= selectedSession.max_slots;
                  const conflict = !booked && getConflictBooking(selectedSession);

                  if (booked) {
                    return (
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-150 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <h6 className="text-xs font-bold text-green-900">Already Registered</h6>
                          <p className="text-[10px] text-green-700 leading-relaxed font-semibold mt-0.5">
                            You have booked this class. We will see you at the scheduled session!
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (full) {
                    return (
                      <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h6 className="text-xs font-bold text-red-900">Fully Booked</h6>
                          <p className="text-[10px] text-red-700 leading-relaxed font-semibold mt-0.5">
                            This session is full. Please select a different class or check other available times.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (conflict) {
                    const conflictTime = new Date(conflict.sessions.start_time).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    return (
                      <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-150 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-700 shrink-0 mt-0.5" />
                        <div>
                          <h6 className="text-xs font-bold text-yellow-900">Schedule Conflict</h6>
                          <p className="text-[10px] text-yellow-700 leading-relaxed font-semibold mt-0.5">
                            Warning: You have another session booked on this day at {conflictTime} which overlaps with this class.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h6 className="text-xs font-bold text-blue-900">Pay in Person</h6>
                        <p className="text-[10px] text-blue-700 leading-relaxed font-semibold mt-0.5">
                          Payments are handled in person at the gym. No credit card is required to confirm bookings online.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Sticky Booking Button */}
            <div className="pt-6 border-t border-gray-100">
              {(() => {
                const booked = isSessionBooked(selectedSession.id);
                const activeB = selectedSession.bookings.filter(b => b.status !== "cancelled");
                const full = activeB.length >= selectedSession.max_slots;
                
                return (
                  <button
                    onClick={() => handleBookSession(selectedSession)}
                    disabled={booked || full || submitting}
                    className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirming...
                      </>
                    ) : booked ? (
                      "Already Registered"
                    ) : full ? (
                      "Class is Full"
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                );
              })()}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

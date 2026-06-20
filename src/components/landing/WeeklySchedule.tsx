"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays, isSameDay } from "date-fns";
import { Loader2, Calendar as CalendarIcon, MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SessionType = {
  id: string;
  title: string;
  duration_minutes: number;
};

type Session = {
  id: string;
  start_time: string;
  end_time: string;
  max_slots: number;
  location: string;
  price: number;
  session_types: SessionType | null;
  bookings: { id: string }[];
};

export function WeeklySchedule() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Generate next 14 days
  const upcomingDays = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const now = new Date().toISOString();
        const endDate = addDays(new Date(), 14).toISOString();

        const { data, error } = await supabase
          .from("sessions")
          .select(`
            id,
            start_time,
            end_time,
            max_slots,
            location,
            price,
            session_types (id, title, duration_minutes),
            bookings (id)
          `)
          .eq("status", "scheduled")
          .gte("start_time", now)
          .lte("start_time", endDate)
          .order("start_time", { ascending: true });

        if (error) throw error;
        setSessions(data as unknown as Session[]);
      } catch (err) {
        console.error("Error fetching public schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const getDaySessions = (date: Date) => {
    return sessions.filter((s) => isSameDay(new Date(s.start_time), date));
  };

  const handleBookClick = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
    } else if (profile?.role === "admin") {
      router.push("/admin/sessions");
    } else {
      router.push(`/dashboard/bookings/new?session=${sessionId}`);
    }
  };

  const displaySessions = getDaySessions(selectedDate);

  return (
    <section className="py-20 bg-[var(--background)] px-6 relative z-10 w-full max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Upcoming Sessions</h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto font-medium">
          Check out our weekly schedule and secure your spot in one of our elite training sessions.
        </p>
      </div>

      {/* Date Selector */}
      <div className="flex overflow-x-auto pb-6 mb-8 gap-3 snap-x hide-scrollbar">
        {upcomingDays.map((date, i) => {
          const isSelected = isSameDay(selectedDate, date);
          const hasSessions = getDaySessions(date).length > 0;
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`snap-start shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border transition-all ${
                isSelected
                  ? "bg-black text-white border-black shadow-lg scale-105"
                  : "bg-white text-black border-gray-200 hover:border-gray-400"
              }`}
            >
              <span className={`text-xs font-bold uppercase mb-1 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                {format(date, "EEE")}
              </span>
              <span className="text-2xl font-black">{format(date, "d")}</span>
              {hasSessions && (
                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? "bg-white" : "bg-black"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Sessions Grid */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : displaySessions.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No sessions scheduled</h3>
            <p className="text-[var(--text-secondary)]">There are no elite training sessions available on this day.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySessions.map((session) => {
              const bookedCount = session.bookings?.length || 0;
              const isFull = bookedCount >= session.max_slots;
              const spotsLeft = session.max_slots - bookedCount;

              return (
                <div 
                  key={session.id} 
                  className="bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600">
                      {format(new Date(session.start_time), "h:mm a")}
                    </div>
                    {isFull ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">Fully Booked</span>
                    ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-black mb-2">{session.session_types?.title}</h3>
                  
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium">
                      <Clock className="w-4 h-4" />
                      {session.session_types?.duration_minutes} Minutes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium">
                      <MapPin className="w-4 h-4" />
                      {session.location}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="font-black text-lg">
                      {session.price > 0 ? `£${session.price.toFixed(2)}` : "Free"}
                    </div>
                    <button
                      onClick={(e) => handleBookClick(e, session.id)}
                      disabled={isFull}
                      className={`group flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        isFull 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-black text-white hover:bg-gray-800 hover:shadow-md'
                      }`}
                    >
                      {isFull ? "Waitlist Full" : "Book Now"}
                      {!isFull && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

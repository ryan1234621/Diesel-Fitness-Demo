"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format, addWeeks, startOfWeek, endOfWeek, isWithinInterval, subWeeks, isBefore, isAfter } from "date-fns";
import { Loader2, Calendar as CalendarIcon, MapPin, Clock, ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
  isPlaceholder?: boolean;
};

export function WeeklySchedule() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize with current week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(currentWeekStart);
  
  // Limits for scrolling (current week up to 3 weeks in advance = 4 weeks total)
  const maxWeekStart = addWeeks(currentWeekStart, 3);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const now = new Date().toISOString();
        const endDate = endOfWeek(maxWeekStart, { weekStartsOn: 1 }).toISOString();

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

  const handlePrevWeek = () => {
    const prev = subWeeks(selectedWeekStart, 1);
    if (!isBefore(prev, currentWeekStart)) {
      setSelectedWeekStart(prev);
    }
  };

  const handleNextWeek = () => {
    const next = addWeeks(selectedWeekStart, 1);
    if (!isAfter(next, maxWeekStart)) {
      setSelectedWeekStart(next);
    }
  };

  const getWeekSessions = (weekStart: Date, weekEnd: Date) => {
    return sessions.filter((s) => 
      isWithinInterval(new Date(s.start_time), { start: weekStart, end: weekEnd })
    );
  };

  const handleBookClick = (e: React.MouseEvent, sessionId: string, isPlaceholder: boolean = false) => {
    e.preventDefault();
    
    if (!user) {
      router.push("/login");
    } else if (profile?.role === "admin") {
      router.push("/admin/sessions");
    } else {
      router.push(`/dashboard/bookings/new?session=${sessionId}`);
    }
  };

  const selectedWeekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });
  
  // Filter sessions for the currently selected week
  let displaySessions = getWeekSessions(selectedWeekStart, selectedWeekEnd);

  // Implement placeholder data if no sessions exist
  if (!loading && displaySessions.length === 0) {
    // Generate a simple deterministic offset based on the week timestamp to vary the demo schedule
    const weekSeed = selectedWeekStart.getTime() / 10000;
    const vary1 = Math.floor(weekSeed % 3);
    const vary2 = Math.floor(weekSeed % 4);
    const vary3 = Math.floor(weekSeed % 5);

    // Provide some varied dates within the selected week for realistic placeholder rendering
    const t1 = new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * (1 + vary1) + 8 * 60 * 60 * 1000);
    const t2 = new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * (2 + (vary2 % 2)) + 18 * 60 * 60 * 1000);
    const t3 = new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * (vary3) + 10 * 60 * 60 * 1000);
    const t4 = new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * ((vary1 + 3) % 7) + 7 * 60 * 60 * 1000);
    const generateFifth = vary2 % 2 === 0;
    const t5 = new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * ((vary3 + 4) % 7) + 17 * 60 * 60 * 1000);

    displaySessions = [
      {
        id: "placeholder-1",
        start_time: t1.toISOString(),
        end_time: new Date(t1.getTime() + 45 * 60 * 1000).toISOString(),
        max_slots: 10,
        location: "Main Studio",
        price: 25,
        session_types: { id: "t1", title: vary1 === 0 ? "HIIT Full Body" : vary1 === 1 ? "Endurance Bootcamp" : "Core Crusher", duration_minutes: 45 },
        bookings: [],
        isPlaceholder: true
      },
      {
        id: "placeholder-2",
        start_time: t2.toISOString(),
        end_time: new Date(t2.getTime() + 60 * 60 * 1000).toISOString(),
        max_slots: 15,
        location: "Outdoor Turf",
        price: 20,
        session_types: { id: "t2", title: vary2 < 2 ? "Strength & Conditioning" : "Kettlebell Flow", duration_minutes: 60 },
        bookings: [{ id: "b1" }, { id: "b2" }], 
        isPlaceholder: true
      },
      {
        id: "placeholder-3",
        start_time: t3.toISOString(),
        end_time: new Date(t3.getTime() + 45 * 60 * 1000).toISOString(),
        max_slots: 8,
        location: "Yoga Studio",
        price: 30,
        session_types: { id: "t3", title: vary3 % 2 === 0 ? "Recovery Flow" : "Power Vinyasa", duration_minutes: 45 },
        bookings: [],
        isPlaceholder: true
      },
      {
        id: "placeholder-4",
        start_time: t4.toISOString(),
        end_time: new Date(t4.getTime() + 45 * 60 * 1000).toISOString(),
        max_slots: 12,
        location: "Main Studio",
        price: 25,
        session_types: { id: "t4", title: "Morning Mobility", duration_minutes: 45 },
        bookings: [{ id: "b3" }],
        isPlaceholder: true
      }
    ];

    if (generateFifth) {
      displaySessions.push({
        id: "placeholder-5",
        start_time: t5.toISOString(),
        end_time: new Date(t5.getTime() + 60 * 60 * 1000).toISOString(),
        max_slots: 20,
        location: "Outdoor Turf",
        price: 15,
        session_types: { id: "t5", title: "Sunset Yoga", duration_minutes: 60 },
        bookings: [],
        isPlaceholder: true
      });
    }
  }

  return (
    <section className="py-20 bg-[var(--background)] px-6 relative z-10 w-full max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Upcoming Sessions</h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto font-medium mb-8">
          Check out our weekly schedule and secure your spot in one of our elite training sessions.
        </p>

        {/* Week Navigator */}
        <div className="inline-flex items-center bg-white/80 border border-gray-100 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm">
          <button
            onClick={handlePrevWeek}
            disabled={isBefore(subWeeks(selectedWeekStart, 1), currentWeekStart)}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="px-6 flex flex-col min-w-[200px]">
            <span className="text-xs font-bold uppercase text-gray-500 mb-0.5">
              {selectedWeekStart.getTime() === currentWeekStart.getTime() ? "This Week" : "Week Of"}
            </span>
            <span className="text-sm font-black whitespace-nowrap">
              {format(selectedWeekStart, "MMM d")} - {format(selectedWeekEnd, "MMM d")}
            </span>
          </div>

          <button
            onClick={handleNextWeek}
            disabled={isAfter(addWeeks(selectedWeekStart, 1), maxWeekStart)}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sessions Content */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 bg-white/40 md:p-4 md:rounded-3xl md:border md:border-white/50 backdrop-blur-md">
            {Array.from({ length: 7 }).map((_, idx) => {
              const day = new Date(selectedWeekStart);
              day.setDate(selectedWeekStart.getDate() + idx);
              
              const daySessions = displaySessions.filter(s => {
                const sDate = new Date(s.start_time);
                return sDate.getDate() === day.getDate() && 
                       sDate.getMonth() === day.getMonth() && 
                       sDate.getFullYear() === day.getFullYear();
              });
              const isToday = new Date().toDateString() === day.toDateString();
              
              // Hide empty days on mobile to save vertical space
              const hideOnMobile = daySessions.length === 0 ? 'hidden md:flex' : 'flex';

              return (
                <div key={idx} className={`flex-col min-h-[150px] md:min-h-[450px] space-y-3 ${hideOnMobile}`}>
                  <div className={`p-3 rounded-2xl text-center flex flex-col border ${
                    isToday ? 'bg-black text-white border-black shadow-sm' : 'bg-white/80 border-white/50'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                      {format(day, "EEE")}
                    </span>
                    <span className="text-lg font-black mt-0.5">
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto md:max-h-[500px] pr-1">
                    {daySessions.length === 0 ? (
                      <div className="text-[10px] font-semibold text-gray-400 text-center py-6">
                        No classes
                      </div>
                    ) : (
                      daySessions.map(session => {
                        const bookedCount = session.bookings?.length || 0;
                        const isFull = bookedCount >= session.max_slots;
                        const spotsLeft = session.max_slots - bookedCount;

                        return (
                          <div 
                            key={session.id}
                            onClick={(e) => !isFull && handleBookClick(e, session.id, session.isPlaceholder)}
                            className={`p-3 rounded-2xl border text-left transition-all hover:-translate-y-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md relative overflow-hidden ${
                              isFull 
                                ? 'bg-red-50/50 border-red-100 cursor-not-allowed'
                                : 'bg-white border-gray-100 hover:border-black/20 cursor-pointer'
                            }`}
                          >
                            {session.isPlaceholder && (
                              <div className="absolute top-2 right-[-25px] bg-yellow-400 text-black text-[8px] font-black uppercase tracking-widest py-0.5 px-8 rotate-45 opacity-90 shadow-sm z-10">
                                Demo
                              </div>
                            )}
                            <span className="text-[9px] font-black text-gray-400 block mb-1">
                              {format(new Date(session.start_time), "h:mm a")}
                            </span>
                            <h4 className="font-bold text-xs text-black line-clamp-1 pr-3">
                              {session.session_types?.title}
                            </h4>
                            
                            <div className="flex flex-col gap-1 mt-2.5 text-[9px] text-[var(--text-secondary)] font-semibold">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                {session.session_types?.duration_minutes}m
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[10px] font-black text-black">
                                {session.price > 0 ? `£${session.price.toFixed(0)}` : "Free"}
                              </span>

                              {isFull ? (
                                <span className="text-[8px] font-black text-red-700 uppercase bg-red-100 px-1.5 py-0.5 rounded">
                                  Full
                                </span>
                              ) : (
                                <span className="text-[8px] font-black text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                                  {spotsLeft} left
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
        )}
      </div>
    </section>
  );
}

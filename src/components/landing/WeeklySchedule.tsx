"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format, addWeeks, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { Loader2, Calendar as CalendarIcon, MapPin, Clock, ArrowRight, LayoutGrid, CalendarDays } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  
  // Initialize with current week
  const today = new Date();
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(startOfWeek(today, { weekStartsOn: 1 }));
  
  // Generate next 4 weeks
  const upcomingWeeks = Array.from({ length: 4 }).map((_, i) => ({
    start: addWeeks(startOfWeek(today, { weekStartsOn: 1 }), i),
    end: endOfWeek(addWeeks(startOfWeek(today, { weekStartsOn: 1 }), i), { weekStartsOn: 1 })
  }));

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const now = new Date().toISOString();
        const endDate = upcomingWeeks[upcomingWeeks.length - 1].end.toISOString();

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

  const getWeekSessions = (weekStart: Date, weekEnd: Date) => {
    return sessions.filter((s) => 
      isWithinInterval(new Date(s.start_time), { start: weekStart, end: weekEnd })
    );
  };

  const handleBookClick = (e: React.MouseEvent, sessionId: string, isPlaceholder: boolean = false) => {
    e.preventDefault();
    if (isPlaceholder) {
      alert("This is a placeholder session for demonstration purposes.");
      return;
    }
    
    if (!user) {
      router.push("/login");
    } else if (profile?.role === "admin") {
      router.push("/admin/sessions");
    } else {
      router.push(`/dashboard/bookings/new?session=${sessionId}`);
    }
  };

  const selectedWeekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });
  
  // Use all fetched sessions for Grid view, and filter by selected week for Calendar view
  let displaySessions = viewMode === "calendar" 
    ? getWeekSessions(selectedWeekStart, selectedWeekEnd) 
    : sessions;

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
        bookings: [{ id: "b1" }, { id: "b2" }], // Fake bookings
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
      }
    ];

    // If Grid view, sort the placeholders chronologically
    if (viewMode === "grid") {
      displaySessions.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }
  }

  return (
    <section className="py-20 bg-[var(--background)] px-6 relative z-10 w-full max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Upcoming Sessions</h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto font-medium mb-8">
          Check out our weekly schedule and secure your spot in one of our elite training sessions.
        </p>

        {/* View Toggle */}
        <div className="inline-flex items-center bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-2xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              viewMode === "grid" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black hover:bg-white/50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Upcoming List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              viewMode === "calendar" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black hover:bg-white/50"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Book via Calendar
          </button>
        </div>
      </div>

      {/* Week Selector (Only visible in Calendar view) */}
      {viewMode === "calendar" && (
        <div className="flex overflow-x-auto pb-6 mb-8 gap-3 snap-x hide-scrollbar">
          {upcomingWeeks.map((week, i) => {
            const isSelected = selectedWeekStart.getTime() === week.start.getTime();
            const weekLabel = i === 0 ? "This Week" : i === 1 ? "Next Week" : `Week ${i + 1}`;
            
            return (
              <button
                key={i}
                onClick={() => setSelectedWeekStart(week.start)}
                className={`snap-start shrink-0 flex flex-col items-center justify-center px-6 py-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-black text-white border-black shadow-lg scale-105"
                    : "bg-white text-black border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className={`text-xs font-bold uppercase mb-1 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                  {weekLabel}
                </span>
                <span className="text-sm font-black whitespace-nowrap">
                  {format(week.start, "MMM d")} - {format(week.end, "MMM d")}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sessions Content */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* GRID VIEW (Default, and fallback for mobile if calendar is selected) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${viewMode === 'grid' ? 'block' : 'hidden md:hidden'}`}>
              {displaySessions.map((session) => {
                const bookedCount = session.bookings?.length || 0;
                const isFull = bookedCount >= session.max_slots;
                const spotsLeft = session.max_slots - bookedCount;
                const sessionDate = new Date(session.start_time);

                return (
                  <div 
                    key={session.id} 
                    className="bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col relative overflow-hidden"
                  >
                    {session.isPlaceholder && (
                      <div className="absolute top-3 right-[-30px] bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest py-1 px-10 rotate-45 opacity-90 shadow-sm z-10">
                        Demo
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600">
                        {format(sessionDate, "MMM d, h:mm a")}
                      </div>
                      {isFull ? (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">Fully Booked</span>
                      ) : (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                          {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-black mb-2 pr-4">{session.session_types?.title}</h3>
                    
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
                        onClick={() => setViewMode("calendar")}
                        className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black transition-all"
                      >
                        <CalendarDays className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                        Book via Calendar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CALENDAR VIEW (Desktop only) */}
            <div className={`hidden md:grid grid-cols-7 gap-4 bg-white/40 p-4 rounded-3xl border border-white/50 backdrop-blur-md ${viewMode === 'calendar' ? 'block' : 'hidden'}`}>
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
                
                return (
                  <div key={idx} className="flex flex-col min-h-[450px] space-y-3">
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

                    <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
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
            
            {/* Mobile Fallback Message for Calendar View */}
            {viewMode === 'calendar' && (
              <div className="md:hidden text-center py-10 px-4 bg-gray-50 rounded-2xl border border-gray-100">
                <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Desktop Only View</h3>
                <p className="text-sm text-gray-500">The calendar view is optimized for larger screens. Switch back to grid view for mobile.</p>
                <button 
                  onClick={() => setViewMode("grid")}
                  className="mt-4 px-4 py-2 bg-black text-white text-sm font-bold rounded-lg shadow-sm"
                >
                  View Grid
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

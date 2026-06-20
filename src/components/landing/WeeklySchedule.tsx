"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format, addWeeks, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
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
  isPlaceholder?: boolean;
};

export function WeeklySchedule() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  let displaySessions = getWeekSessions(selectedWeekStart, selectedWeekEnd);

  // Implement placeholder data if no sessions exist for the selected week
  if (!loading && displaySessions.length === 0) {
    displaySessions = [
      {
        id: "placeholder-1",
        start_time: new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * 1 + 8 * 60 * 60 * 1000).toISOString(), // Tuesday 8am
        end_time: new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * 1 + 9 * 60 * 60 * 1000).toISOString(),
        max_slots: 10,
        location: "Main Studio",
        price: 25,
        session_types: { id: "t1", title: "HIIT Full Body", duration_minutes: 45 },
        bookings: [],
        isPlaceholder: true
      },
      {
        id: "placeholder-2",
        start_time: new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * 3 + 18 * 60 * 60 * 1000).toISOString(), // Thursday 6pm
        end_time: new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * 3 + 19 * 60 * 60 * 1000).toISOString(),
        max_slots: 15,
        location: "Outdoor Turf",
        price: 20,
        session_types: { id: "t2", title: "Strength & Conditioning", duration_minutes: 60 },
        bookings: [{ id: "b1" }, { id: "b2" }], // Fake bookings
        isPlaceholder: true
      },
      {
        id: "placeholder-3",
        start_time: new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * 5 + 10 * 60 * 60 * 1000).toISOString(), // Saturday 10am
        end_time: new Date(selectedWeekStart.getTime() + 24 * 60 * 60 * 1000 * 5 + 11 * 60 * 60 * 1000).toISOString(),
        max_slots: 8,
        location: "Yoga Studio",
        price: 30,
        session_types: { id: "t3", title: "Recovery Flow", duration_minutes: 45 },
        bookings: [],
        isPlaceholder: true
      }
    ];
  }

  return (
    <section className="py-20 bg-[var(--background)] px-6 relative z-10 w-full max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Upcoming Sessions</h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto font-medium">
          Check out our weekly schedule and secure your spot in one of our elite training sessions.
        </p>
      </div>

      {/* Week Selector */}
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

      {/* Sessions Grid */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      {format(sessionDate, "EEE, h:mm a")}
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
                      onClick={(e) => handleBookClick(e, session.id, session.isPlaceholder)}
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

"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  Activity, 
  DollarSign, 
  Plus, 
  ArrowRight, 
  ChevronDown, 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  CreditCard, 
  Eye, 
  X,
  Info
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  status: string;
  payment_status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
  sessions: {
    start_time: string;
    end_time: string;
    price: number;
    session_types: {
      title: string;
    } | null;
  } | null;
};

type Session = {
  id: string;
  start_time: string;
  end_time: string;
  location: string;
  price: number;
  status: string;
  created_at?: string;
  session_types: {
    title: string;
    duration_minutes: number;
  } | null;
  bookings: {
    id: string;
    status: string;
  }[];
};

type ActivityItem = {
  id: string;
  type: "user" | "admin";
  title: string;
  description: string;
  timestamp: string;
  rawDate: Date;
  meta?: Booking;
};

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    revenue: 0,
    revenueTrend: 0,
    activeClients: 0,
    activeClientsTrend: 0,
    bookingsCount: 0,
    bookingsTrend: 0,
    sessionsCount: 0,
    sessionsTrend: 0
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityFilter, setActivityFilter] = useState<"all" | "user" | "admin">("all");
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [inspectingBooking, setInspectingBooking] = useState<Booking | null>(null);

  const getDateRanges = (range: string) => {
    const now = new Date();
    let currentStart = new Date();
    let currentEnd = new Date(now);
    let previousStart = new Date();
    let previousEnd = new Date();

    switch (range) {
      case "Today":
        currentStart.setHours(0, 0, 0, 0);
        currentEnd.setHours(23, 59, 59, 999);
        previousStart.setDate(now.getDate() - 1);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd.setDate(now.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        break;
        
      case "Last 7 Days":
        currentStart.setDate(now.getDate() - 7);
        previousStart.setDate(now.getDate() - 14);
        previousEnd.setDate(now.getDate() - 7);
        break;

      case "Last 30 Days":
        currentStart.setDate(now.getDate() - 30);
        previousStart.setDate(now.getDate() - 60);
        previousEnd.setDate(now.getDate() - 30);
        break;

      case "This Month":
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;

      case "Year to Date":
        currentStart = new Date(now.getFullYear(), 0, 1);
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;
    }

    return { currentStart, currentEnd, previousStart, previousEnd };
  };

  const loadDashboardData = async (range: string) => {
    try {
      setLoading(true);
      const { currentStart, currentEnd, previousStart, previousEnd } = getDateRanges(range);
      const now = new Date();

      // 1. Fetch Bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          payment_status,
          created_at,
          profiles (full_name, email),
          sessions (
            start_time,
            end_time,
            price,
            session_types (title)
          )
        `)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // 2. Fetch Profiles (Active clients)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, role, status, created_at")
        .eq("role", "client")
        .eq("status", "active");

      if (profilesError) throw profilesError;

      // 3. Fetch Sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select(`
          id,
          start_time,
          end_time,
          location,
          price,
          status,
          created_at,
          session_types (title, duration_minutes),
          bookings (id, status)
        `)
        .order("start_time", { ascending: true });

      if (sessionsError) throw sessionsError;

      // 4. Fetch Bookings History (Admin actions)
      const { data: historyData, error: historyError } = await supabase
        .from("bookings_history")
        .select(`
          id,
          action,
          created_at,
          profiles:changed_by (full_name, email, role)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (historyError) throw historyError;

      const typedBookings = (bookingsData || []) as any[] as Booking[];
      const typedProfiles = (profilesData || []) as any[];
      const typedSessions = (sessionsData || []) as any[] as Session[];
      const typedHistory = (historyData || []) as any[];

      // Filter Bookings by Range
      const currentBookings = typedBookings.filter(b => {
        const date = new Date(b.created_at);
        return date >= currentStart && date <= currentEnd;
      });

      const previousBookings = typedBookings.filter(b => {
        const date = new Date(b.created_at);
        return date >= previousStart && date <= previousEnd;
      });

      // Calculate Revenue (paid and confirmed bookings)
      const getRevenue = (list: Booking[]) => 
        list
          .filter(b => b.payment_status === "paid" && b.status === "confirmed")
          .reduce((sum, b) => sum + Number(b.sessions?.price || 0), 0);

      const currentRev = getRevenue(currentBookings);
      const previousRev = getRevenue(previousBookings);
      const revTrend = previousRev > 0 ? Math.round(((currentRev - previousRev) / previousRev) * 100) : 0;

      // Calculate Bookings Count
      const currentBookingsCount = currentBookings.filter(b => b.status !== "cancelled").length;
      const previousBookingsCount = previousBookings.filter(b => b.status !== "cancelled").length;
      const bookingsCountTrend = previousBookingsCount > 0 
        ? Math.round(((currentBookingsCount - previousBookingsCount) / previousBookingsCount) * 100)
        : 0;

      // Calculate Active Clients Count and Trend
      const currentClientsCount = typedProfiles.filter(p => new Date(p.created_at) <= currentEnd).length;
      const previousClientsCount = typedProfiles.filter(p => new Date(p.created_at) <= previousEnd).length;
      const clientsTrend = currentClientsCount - previousClientsCount;

      // Calculate Sessions Scheduled in Range (excluding cancelled)
      const currentSessions = typedSessions.filter(s => {
        const date = new Date(s.start_time);
        return date >= currentStart && date <= currentEnd && s.status !== "cancelled";
      });
      const previousSessions = typedSessions.filter(s => {
        const date = new Date(s.start_time);
        return date >= previousStart && date <= previousEnd && s.status !== "cancelled";
      });
      const currentSessionsCount = currentSessions.length;
      const previousSessionsCount = previousSessions.length;
      const sessionsTrend = previousSessionsCount > 0
        ? Math.round(((currentSessionsCount - previousSessionsCount) / previousSessionsCount) * 100)
        : 0;

      setStats({
        revenue: currentRev,
        revenueTrend: revTrend,
        activeClients: currentClientsCount,
        activeClientsTrend: clientsTrend,
        bookingsCount: currentBookingsCount,
        bookingsTrend: bookingsCountTrend,
        sessionsCount: currentSessionsCount,
        sessionsTrend: sessionsTrend
      });

      // Compile Unified Activities
      const userActivities: ActivityItem[] = typedBookings.map(b => ({
        id: `booking-${b.id}`,
        type: "user",
        title: `${b.profiles?.full_name || "A client"} booked a session`,
        description: b.sessions?.session_types?.title || "Session",
        timestamp: new Date(b.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        rawDate: new Date(b.created_at),
        meta: b
      }));

      const sessionActivities: ActivityItem[] = typedSessions.map(s => ({
        id: `session-${s.id}`,
        type: "admin",
        title: "Admin scheduled a session",
        description: `${s.session_types?.title} at ${s.location}`,
        timestamp: new Date(s.created_at || s.start_time).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        rawDate: new Date(s.created_at || s.start_time)
      }));

      const auditActivities: ActivityItem[] = typedHistory.map(ah => {
        const actionPretty = ah.action.replace("status_updated_to_", "").toUpperCase();
        return {
          id: `audit-${ah.id}`,
          type: "admin",
          title: `${ah.profiles?.full_name || "Admin"} updated booking`,
          description: `Set booking status to ${actionPretty}`,
          timestamp: new Date(ah.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          rawDate: new Date(ah.created_at)
        };
      });

      const mergedActivities = [...userActivities, ...sessionActivities, ...auditActivities]
        .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
        .slice(0, 15);

      setActivities(mergedActivities);

      // Set Upcoming Sessions
      const upcoming = typedSessions
        .filter(s => new Date(s.start_time) >= now)
        .slice(0, 5);
      setUpcomingSessions(upcoming);

    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(dateRange);
  }, [dateRange]);

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const { data: oldBooking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      // Log action to bookings_history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("bookings_history").insert({
          booking_id: id,
          action: `status_updated_to_${newStatus}`,
          changed_by: user.id,
          previous_data: oldBooking,
          new_data: { ...oldBooking, status: newStatus }
        });
      }

      if (inspectingBooking && inspectingBooking.id === id) {
        setInspectingBooking({ ...inspectingBooking, status: newStatus });
      }
      
      // Reload stats and unified activity feed
      loadDashboardData(dateRange);
    } catch (err: any) {
      console.error("Error updating booking status:", err);
      alert("Error updating booking: " + err.message);
    }
  };

  const TrendIndicator = ({ value, isAbsolute = false }: { value: number; isAbsolute?: boolean }) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
        isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
      }`}>
        {isPositive ? "+" : ""}{value}{isAbsolute ? "" : "%"}
      </span>
    );
  };

  const filteredActivities = activities.filter(act => {
    if (activityFilter === "all") return true;
    return act.type === activityFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Admin Overview</h1>
          <p className="text-[var(--text-secondary)]">High-level metrics and recent activity.</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="relative">
          <button 
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            {dateRange}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {showDateFilter && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-2">
              {["Today", "Last 7 Days", "Last 30 Days", "This Month", "Year to Date"].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateRange(range);
                    setShowDateFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    dateRange === range ? "bg-gray-50 font-bold text-black" : "text-gray-600 hover:bg-gray-50 hover:text-black font-medium"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[300px]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Metrics Panel */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Revenue Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-black" />
                </div>
                <TrendIndicator value={stats.revenueTrend} />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Revenue</p>
                <div className="relative group/tooltip flex items-center">
                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-black cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black/90 backdrop-blur-sm text-white text-[10px] rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-30 text-center shadow-xl font-medium leading-relaxed">
                    Total revenue from paid & confirmed bookings created during this period.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
                  </div>
                </div>
              </div>
              <p className="text-3xl font-black">£{stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            
            {/* Active Clients Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <TrendIndicator value={stats.activeClientsTrend} isAbsolute={true} />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Active Clients</p>
                <div className="relative group/tooltip flex items-center">
                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-black cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black/90 backdrop-blur-sm text-white text-[10px] rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-30 text-center shadow-xl font-medium leading-relaxed">
                    Total active client accounts registered in the database.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
                  </div>
                </div>
              </div>
              <p className="text-3xl font-black">{stats.activeClients}</p>
            </div>

            {/* Bookings Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-black" />
                </div>
                <TrendIndicator value={stats.bookingsTrend} />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Bookings</p>
                <div className="relative group/tooltip flex items-center">
                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-black cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black/90 backdrop-blur-sm text-white text-[10px] rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-30 text-center shadow-xl font-medium leading-relaxed">
                    Number of bookings (excluding cancelled) created during this period.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
                  </div>
                </div>
              </div>
              <p className="text-3xl font-black">{stats.bookingsCount}</p>
            </div>

            {/* Sessions Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-black" />
                </div>
                <TrendIndicator value={stats.sessionsTrend} />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Sessions</p>
                <div className="relative group/tooltip flex items-center">
                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-black cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black/90 backdrop-blur-sm text-white text-[10px] rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-30 text-center shadow-xl font-medium leading-relaxed">
                    Number of scheduled (excluding cancelled) sessions starting during this period.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
                  </div>
                </div>
              </div>
              <p className="text-3xl font-black">{stats.sessionsCount}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin/sessions" className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                <Plus className="w-5 h-5" />
                Schedule Session
              </Link>
              <Link href="/admin/clients" className="flex items-center gap-2 px-6 py-3 bg-[#F4F3EF] text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                <Plus className="w-5 h-5" />
                Add Client
              </Link>
              <Link href="/admin/sessions" className="flex items-center gap-2 px-6 py-3 bg-[#F4F3EF] text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                <Plus className="w-5 h-5" />
                Create Category
              </Link>
            </div>
          </div>

          {/* Lists Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold">Recent Activity</h2>
                  
                  {/* Activity Filter */}
                  <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-wide w-full sm:w-auto">
                    {(["all", "user", "admin"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActivityFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          activityFilter === filter
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredActivities.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-secondary)]">No recent activity found.</div>
                ) : (
                  <div className="space-y-4">
                    {filteredActivities.map((act) => (
                      <div 
                        key={act.id}
                        onClick={() => act.meta && setInspectingBooking(act.meta)}
                        className={`flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 rounded-2xl border border-gray-100/50 transition-all ${
                          act.meta ? "cursor-pointer group" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-gray-200/50 text-black flex items-center justify-center rounded-full font-bold shadow-sm shrink-0">
                            {act.type === "admin" ? (
                              <Activity className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Users className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-black group-hover:text-gray-900">{act.title}</div>
                            <div className="text-xs text-[var(--text-secondary)]">{act.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                            act.type === "admin" 
                              ? "bg-purple-50/80 border-purple-100 text-purple-700" 
                              : "bg-blue-50/80 border-blue-100 text-blue-700"
                          }`}>
                            {act.type}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] font-medium">
                            {act.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
                  <Link href="/admin/sessions" className="text-sm font-bold text-gray-500 hover:text-black flex items-center gap-1 group transition-colors">
                    View Schedule <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-secondary)]">No upcoming sessions.</div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => {
                      const sessionStart = new Date(session.start_time);
                      const activeBookings = session.bookings?.filter(b => b.status !== 'cancelled').length || 0;
                      return (
                        <div 
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border border-gray-200/50 text-black flex items-center justify-center rounded-full font-bold shadow-sm shrink-0">
                              <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-bold text-black">{session.session_types?.title}</div>
                              <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {sessionStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at {sessionStart.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-black">£{Number(session.price).toFixed(2)}</div>
                            <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide mt-0.5">
                              {activeBookings} {activeBookings === 1 ? "client" : "clients"} booked
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Booking Detail Inspector Modal */}
      {inspectingBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-white/20 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <button 
              onClick={() => setInspectingBooking(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-1">Booking Details</h2>
              <p className="text-[var(--text-secondary)] text-sm">Created on {new Date(inspectingBooking.created_at).toLocaleDateString()}</p>
            </div>

            <div className="space-y-6">
              {/* Client Info */}
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-black font-bold text-lg">
                    {inspectingBooking.profiles?.full_name?.substring(0, 2).toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{inspectingBooking.profiles?.full_name || "Unnamed Client"}</div>
                    <div className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                      {inspectingBooking.profiles?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              {inspectingBooking.sessions && (
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Session Details</h3>
                  <div className="font-black text-xl mb-3">{inspectingBooking.sessions.session_types?.title}</div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(inspectingBooking.sessions.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(inspectingBooking.sessions.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment</h3>
                  <div className="flex items-center gap-2 font-bold">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    £{Number(inspectingBooking.sessions?.price || 0).toFixed(2)}
                  </div>
                  <span className={`inline-block mt-2 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                    inspectingBooking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {inspectingBooking.payment_status}
                  </span>
                </div>
                
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h3>
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wide border ${
                    inspectingBooking.status === 'confirmed' ? 'bg-blue-50/80 border-blue-100 text-blue-700' : 
                    inspectingBooking.status === 'cancelled' ? 'bg-red-50/80 border-red-100 text-red-700' :
                    'bg-gray-50/80 border-gray-100 text-gray-700'
                  }`}>
                    {inspectingBooking.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                {inspectingBooking.status === 'pending' && (
                  <button
                    onClick={() => updateBookingStatus(inspectingBooking.id, 'confirmed')}
                    className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Confirm Booking
                  </button>
                )}
                {inspectingBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => updateBookingStatus(inspectingBooking.id, 'cancelled')}
                    className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

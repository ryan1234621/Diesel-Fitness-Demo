"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Loader2, CheckCircle, XCircle, Calendar as CalendarIcon, User as UserIcon, Eye, MapPin, Clock, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  status: string;
  payment_status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
  sessions: {
    start_time: string;
    end_time: string;
    location: string;
    price: number;
    session_types: {
      title: string;
      duration_minutes: number;
    };
  };
};

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [inspectingBooking, setInspectingBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          profiles (full_name, email),
          sessions (
            start_time,
            end_time,
            location,
            price,
            session_types (title, duration_minutes)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setBookings((data || []) as any);
    } catch (err: any) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      console.error("Error updating booking:", err);
      alert("Error updating booking: " + err.message);
    } finally {
      setActionMenuOpen(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.profiles?.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (booking.profiles?.email.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (booking.sessions?.session_types?.title.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1">Booking Management</h2>
          <p className="text-[var(--text-secondary)]">Review and manage client session bookings.</p>
        </div>
      </div>

      {/* Content Area with Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 min-h-[500px] relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-br from-gray-100 to-transparent blur-3xl opacity-50 pointer-events-none"></div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name or session..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200/60 bg-white/50 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200/60 rounded-xl font-bold hover:bg-gray-50/50 transition-colors appearance-none bg-white/50 backdrop-blur-sm min-w-[150px] shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex justify-center py-20 relative z-10">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-secondary)] border-2 border-dashed border-gray-200/60 rounded-3xl relative z-10 bg-white/30 backdrop-blur-sm">
            No bookings match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Client</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Session Info</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Payment</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {filteredBookings.map((booking) => {
                  const sessionStart = new Date(booking.sessions?.start_time || "");
                  return (
                    <tr key={booking.id} className="hover:bg-white/60 transition-all duration-200 group">
                      <td className="py-4 px-6 cursor-pointer" onClick={() => setInspectingBooking(booking)}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 text-black flex items-center justify-center rounded-full shadow-sm border border-gray-200/50">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-black">{booking.profiles?.full_name || "Unnamed"}</div>
                            <div className="text-xs text-[var(--text-secondary)]">{booking.profiles?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-black">{booking.sessions?.session_types?.title}</div>
                        <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                          <CalendarIcon className="w-3 h-3" />
                          {sessionStart.toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          booking.payment_status === 'paid' ? 'bg-green-50/80 border-green-100 text-green-700' : 'bg-yellow-50/80 border-yellow-100 text-yellow-700'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          booking.status === 'confirmed' ? 'bg-blue-50/80 border-blue-100 text-blue-700' : 
                          booking.status === 'cancelled' ? 'bg-red-50/80 border-red-100 text-red-700' :
                          'bg-gray-50/80 border-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right relative">
                        <button 
                          onClick={() => setActionMenuOpen(actionMenuOpen === booking.id ? null : booking.id)}
                          className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-white shadow-sm opacity-50 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {actionMenuOpen === booking.id && (
                          <div className="absolute right-8 top-10 w-48 bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200 divide-y divide-gray-50">
                            <div className="py-1">
                              <button 
                                onClick={() => { setInspectingBooking(booking); setActionMenuOpen(null); }}
                                className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50/50 flex items-center gap-3 transition-colors"
                              >
                                <Eye className="w-4 h-4" /> View Details
                              </button>
                            </div>
                            
                            <div className="py-1">
                              {booking.status === 'pending' && (
                                <button 
                                  onClick={() => updateStatus(booking.id, 'confirmed')}
                                  className="w-full px-4 py-2 text-left text-sm font-bold text-green-600 hover:bg-green-50/50 flex items-center gap-3 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" /> Confirm Booking
                                </button>
                              )}
                              {booking.status !== 'cancelled' && (
                                <button 
                                  onClick={() => updateStatus(booking.id, 'cancelled')}
                                  className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50/50 flex items-center gap-3 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" /> Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Inspector Modal */}
      {inspectingBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-white/20 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <button 
              onClick={() => setInspectingBooking(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
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
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Session Details</h3>
                <div className="font-black text-xl mb-3">{inspectingBooking.sessions?.session_types?.title}</div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    {new Date(inspectingBooking.sessions?.start_time || "").toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {new Date(inspectingBooking.sessions?.start_time || "").toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {inspectingBooking.sessions?.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {inspectingBooking.sessions?.session_types?.duration_minutes} mins
                  </div>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment</h3>
                  <div className="flex items-center gap-2 font-bold">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    ${Number(inspectingBooking.sessions?.price || 0).toFixed(2)}
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

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

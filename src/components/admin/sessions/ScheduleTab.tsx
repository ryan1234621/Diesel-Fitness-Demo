"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Loader2, X, Calendar as CalendarIcon, Clock, Repeat, Eye, MapPin, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SessionType = {
  id: string;
  title: string;
  duration_minutes: number;
  price: number;
  location: string;
  max_slots: number;
  capacity: number | null;
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
  session_types?: { title: string };
  bookings?: { 
    id: string; 
    status: string;
    profiles?: {
      full_name: string | null;
      email: string;
    } | null;
  }[];
};

export function ScheduleTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    session_name: "",
    start_date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
    max_slots: "" as string | number,
    description: "",
    is_recurring: false,
    occurrences: 4
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch active session types for the dropdown
      const { data: typesData, error: typesError } = await supabase.from("session_types").select("*").eq("is_active", true).order("title");
      if (typesError) throw typesError;
      setSessionTypes(typesData || []);

      // Fetch all scheduled sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select(`*, session_types(title), bookings(id, status, profiles(full_name, email))`)
        .order("start_time", { ascending: false });
      
      if (sessionError) throw sessionError;
      setSessions(sessionData || []);
      
      // If modal is open, update selectedSession with fresh data
      if (selectedSession) {
        const freshSession = sessionData?.find((s) => s.id === selectedSession.id);
        if (freshSession) {
          setSelectedSession(freshSession);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (session?: Session) => {
    if (session) {
      setEditingSession(session);
      const start = new Date(session.start_time);
      const hours = String(start.getHours()).padStart(2, '0');
      const mins = String(start.getMinutes()).padStart(2, '0');
      setFormData({
        session_name: session.session_types?.title || "",
        start_date: start.toISOString().split('T')[0],
        start_time: `${hours}:${mins}`,
        max_slots: session.max_slots,
        description: session.description || "",
        is_recurring: false,
        occurrences: 4
      });
    } else {
      setEditingSession(null);
      setFormData({
        session_name: "",
        start_date: new Date().toISOString().split('T')[0],
        start_time: "09:00",
        max_slots: "",
        description: "",
        is_recurring: false,
        occurrences: 4
      });
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleSessionNameChange = (name: string) => {
    const matchedType = sessionTypes.find(
      (t) => t.title.toLowerCase() === name.trim().toLowerCase()
    );
    
    setFormData((prev) => ({
      ...prev,
      session_name: name,
      max_slots: matchedType 
        ? (matchedType.capacity !== null && matchedType.capacity !== undefined ? matchedType.capacity : matchedType.max_slots)
        : prev.max_slots
    }));
  };

  const handleOpenViewModal = (session: Session) => {
    setSelectedSession(session);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.session_name.trim()) {
      setError("Session name is required.");
      return;
    }
    if (!formData.max_slots) {
      setError("Capacity is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      let selectedType = sessionTypes.find(
        (t) => t.title.toLowerCase() === formData.session_name.trim().toLowerCase()
      );

      if (!selectedType) {
        // Create new session type template on the fly
        const { data: newType, error: typeError } = await supabase
          .from("session_types")
          .insert([
            {
              title: formData.session_name.trim(),
              duration_minutes: 60,
              price: 0,
              max_slots: Number(formData.max_slots) || 15,
              location: "On Premises",
              is_active: true,
              capacity: Number(formData.max_slots) || null
            },
          ])
          .select()
          .single();

        if (typeError) throw typeError;
        selectedType = newType;
        setSessionTypes((prev) => [...prev, newType]);
      }

      if (!selectedType) {
        throw new Error("Could not find or create session template.");
      }

      const baseDate = new Date(`${formData.start_date}T${formData.start_time}:00`);

      if (editingSession) {
        const end = new Date(baseDate);
        end.setMinutes(end.getMinutes() + selectedType.duration_minutes);

        const { error: updateError } = await supabase
          .from("sessions")
          .update({
            session_type_id: selectedType.id,
            start_time: baseDate.toISOString(),
            end_time: end.toISOString(),
            max_slots: Number(formData.max_slots),
            description: formData.description,
            price: selectedType.price,
            location: selectedType.location
          })
          .eq("id", editingSession.id);

        if (updateError) throw updateError;
      } else {
        const payloadArray = [];
        const totalOccurrences = formData.is_recurring ? formData.occurrences : 1;

        for (let i = 0; i < totalOccurrences; i++) {
          const currentStartTime = new Date(baseDate);
          currentStartTime.setDate(currentStartTime.getDate() + (i * 7));

          const currentEndTime = new Date(currentStartTime);
          currentEndTime.setMinutes(currentEndTime.getMinutes() + selectedType.duration_minutes);

          payloadArray.push({
            session_type_id: selectedType.id,
            start_time: currentStartTime.toISOString(),
            end_time: currentEndTime.toISOString(),
            max_slots: Number(formData.max_slots),
            description: formData.description,
            price: selectedType.price,
            location: selectedType.location,
            status: 'scheduled'
          });
        }

        const { error: insertError } = await supabase
          .from("sessions")
          .insert(payloadArray);
        
        if (insertError) throw insertError;

        // Fetch all active client, user, and admin profiles to notify them
        const { data: activeProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id")
          .in("role", ["client", "user", "admin"])
          .eq("status", "active");

        if (profilesError) {
          console.error("Error fetching active profiles for notifications:", profilesError);
        } else if (activeProfiles && activeProfiles.length > 0) {
          const notificationsPayload = [];
          
          for (const sessionPayload of payloadArray) {
            const dateFormatted = new Date(sessionPayload.start_time).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            for (const profile of activeProfiles) {
              notificationsPayload.push({
                user_id: profile.id,
                title: "New Session Scheduled",
                message: `A new session "${selectedType.title}" has been scheduled for ${dateFormatted}.`,
                type: "session_scheduled",
                is_read: false
              });
            }
          }

          if (notificationsPayload.length > 0) {
            const { error: notifError } = await supabase
              .from("notifications")
              .insert(notificationsPayload);
            
            if (notifError) {
              console.error("Error inserting session notifications:", notifError);
            }
          }
        }
      }
      
      await fetchData();
      setIsModalOpen(false);
      setEditingSession(null);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session? Any existing bookings will be orphaned or cancelled.")) return;
    
    try {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
      setSessions(sessions.filter(s => s.id !== id));
      setIsViewModalOpen(false);
      setSelectedSession(null);
    } catch (err: any) {
      console.error("Error deleting session:", err);
      alert("Error deleting session: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Schedule Session
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)] border-2 border-dashed border-gray-200 rounded-3xl">
          No upcoming sessions found. Schedule one to get started!
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Date & Time</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Session</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Description</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Capacity</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((session) => {
                const start = new Date(session.start_time);
                const end = new Date(session.end_time);
                const duration = Math.round((end.getTime() - start.getTime()) / 60000);

                return (
                  <tr 
                    key={session.id} 
                    onClick={() => handleOpenViewModal(session)}
                    className="hover:bg-white/60 transition-all duration-200 group cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold flex items-center gap-2 text-black">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({duration} mins)
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-black">{session.session_types?.title}</td>
                    <td className="py-4 px-6 text-sm text-[var(--text-secondary)] max-w-xs truncate">
                      {session.description || "No description"}
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        const activeBookings = session.bookings?.filter(b => b.status !== 'cancelled').length || 0;
                        const isFull = activeBookings >= session.max_slots;
                        return (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                            isFull ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
                          }`}>
                            {activeBookings} / {session.max_slots} Booked
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-xs font-bold px-2 py-1 bg-gray-100 rounded-md">
                        {session.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenViewModal(session)}
                        className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-white shadow-sm"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl relative my-8">
            <button 
              onClick={() => {
                setIsModalOpen(false);
                setEditingSession(null);
              }}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-black mb-6">{editingSession ? "Edit Scheduled Session" : "Schedule Session"}</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Session</label>
                <input
                  type="text"
                  required
                  value={formData.session_name}
                  onChange={(e) => handleSessionNameChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="e.g. Boxing Class"
                  list="session-templates"
                />
                <datalist id="session-templates">
                  {sessionTypes.map((t) => (
                    <option key={t.id} value={t.title} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.max_slots}
                  onChange={(e) => setFormData({ ...formData, max_slots: e.target.value !== "" ? parseInt(e.target.value) : "" })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
                  placeholder="Specific session details..."
                />
              </div>

              {!editingSession && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={formData.is_recurring}
                        onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${formData.is_recurring ? 'bg-black' : 'bg-gray-200'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_recurring ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      <Repeat className="w-4 h-4" /> Recurring Weekly
                    </div>
                  </label>

                  {formData.is_recurring && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Number of Weeks</label>
                      <input
                        type="number"
                        min="2"
                        max="52"
                        required={formData.is_recurring}
                        value={formData.occurrences}
                        onChange={(e) => setFormData({ ...formData, occurrences: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                      <p className="text-xs text-[var(--text-secondary)] mt-2">
                        This will schedule {formData.occurrences} sessions at {formData.start_time} on the same day every week.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingSession ? "Save Changes" : (formData.is_recurring ? `Schedule ${formData.occurrences} Sessions` : "Schedule Session")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Session Modal */}
      {isViewModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-white/20 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <button 
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedSession(null);
              }}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-black mb-1">Session Details</h2>
              <span className="capitalize text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-md inline-block mt-2">
                {selectedSession.status}
              </span>
            </div>

            <div className="space-y-6">
              {/* Session Type */}
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Session Title</h3>
                <div className="font-black text-xl text-black">{selectedSession.session_types?.title}</div>
              </div>

              {/* Description */}
              {selectedSession.description && (
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedSession.description}</p>
                </div>
              )}

              {/* Schedule */}
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Schedule & Location</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    {new Date(selectedSession.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    {new Date(selectedSession.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSession.end_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{selectedSession.location || "On Premises"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    {Math.round((new Date(selectedSession.end_time).getTime() - new Date(selectedSession.start_time).getTime()) / 60000)} mins
                  </div>
                </div>
              </div>

              {/* Pricing & Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price</h3>
                  <div className="font-black text-lg text-black">
                    £{Number(selectedSession.price || 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Capacity</h3>
                  <div className="font-black text-lg text-black">
                    {selectedSession.bookings?.filter(b => b.status !== 'cancelled').length || 0} / {selectedSession.max_slots} Booked
                  </div>
                </div>
              </div>

              {/* Booked Clients */}
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Booked Clients</h3>
                {(() => {
                  const activeBookings = selectedSession.bookings?.filter(b => b.status !== 'cancelled') || [];
                  if (activeBookings.length === 0) {
                    return <p className="text-sm text-[var(--text-secondary)] font-semibold">No active bookings yet.</p>;
                  }
                  return (
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {activeBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-50 to-gray-100 text-black flex items-center justify-center rounded-full font-bold text-xs shrink-0 border border-gray-200/50">
                              {(booking.profiles?.full_name || booking.profiles?.email || "?").substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-black truncate">{booking.profiles?.full_name || "Unnamed Client"}</div>
                              <div className="text-[10px] text-[var(--text-secondary)] truncate">{booking.profiles?.email}</div>
                            </div>
                          </div>
                          <span className={`capitalize text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            booking.status === 'confirmed' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                            booking.status === 'pending' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                            'bg-gray-50 border-gray-100 text-gray-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Quick Actions (Delete/Edit Session) */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenModal(selectedSession);
                  }}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-black font-bold rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Session
                </button>
                <button
                  onClick={() => handleDelete(selectedSession.id)}
                  className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all text-sm shadow-sm"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  Delete Session
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

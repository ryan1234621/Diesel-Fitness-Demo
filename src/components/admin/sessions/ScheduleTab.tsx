"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Loader2, X, Calendar as CalendarIcon, Clock, Repeat } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SessionType = {
  id: string;
  title: string;
  duration_minutes: number;
  price: number;
  location: string;
  max_slots: number;
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
  session_types?: { title: string };
};

export function ScheduleTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    session_type_id: "",
    start_date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
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

      // Fetch upcoming sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select(`*, session_types(title)`)
        .gte("start_time", new Date().toISOString())
        .order("start_time");
      
      if (sessionError) throw sessionError;
      setSessions(sessionData || []);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      session_type_id: sessionTypes.length > 0 ? sessionTypes[0].id : "",
      start_date: new Date().toISOString().split('T')[0],
      start_time: "09:00",
      is_recurring: false,
      occurrences: 4
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const selectedType = sessionTypes.find(t => t.id === formData.session_type_id);
      if (!selectedType) throw new Error("Please select a session template.");

      const payloadArray = [];
      const baseDate = new Date(`${formData.start_date}T${formData.start_time}:00`);

      const totalOccurrences = formData.is_recurring ? formData.occurrences : 1;

      for (let i = 0; i < totalOccurrences; i++) {
        // Calculate start time for this occurrence (adding 7 days per iteration)
        const currentStartTime = new Date(baseDate);
        currentStartTime.setDate(currentStartTime.getDate() + (i * 7));

        // Calculate end time by adding duration
        const currentEndTime = new Date(currentStartTime);
        currentEndTime.setMinutes(currentEndTime.getMinutes() + selectedType.duration_minutes);

        payloadArray.push({
          session_type_id: selectedType.id,
          start_time: currentStartTime.toISOString(),
          end_time: currentEndTime.toISOString(),
          max_slots: selectedType.max_slots,
          price: selectedType.price,
          location: selectedType.location,
          status: 'scheduled'
        });
      }

      const { error: insertError } = await supabase
        .from("sessions")
        .insert(payloadArray);
      
      if (insertError) throw insertError;
      
      await fetchData();
      setIsModalOpen(false);
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
    } catch (err: any) {
      console.error("Error deleting session:", err);
      alert("Error deleting session: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleOpenModal}
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
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({duration} mins)
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-black">{session.session_types?.title}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800">
                        0 / {session.max_slots} Booked
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-xs font-bold px-2 py-1 bg-gray-100 rounded-md">
                        {session.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(session.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-black mb-6">Schedule Session</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Template</label>
                <select
                  required
                  value={formData.session_type_id}
                  onChange={(e) => setFormData({ ...formData, session_type_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
                >
                  <option value="" disabled>Select a template</option>
                  {sessionTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.title} ({t.duration_minutes}m)</option>
                  ))}
                </select>
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {formData.is_recurring ? `Schedule ${formData.occurrences} Sessions` : "Schedule Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

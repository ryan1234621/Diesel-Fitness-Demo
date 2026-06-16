"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Mail, Loader2, UserX, CheckCircle, ShieldAlert, Shield, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
};

export default function ClientsManagement() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        // Remove the .in() filter to allow fetching admins as well, if we want to see who we upgraded
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      setClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert("Error updating status: " + err.message);
    } finally {
      setActionMenuOpen(null);
    }
  };

  const updateRole = async (id: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", id);
      
      if (error) throw error;
      setClients(clients.map(c => c.id === id ? { ...c, role: newRole } : c));
    } catch (err: any) {
      console.error("Error updating role:", err);
      alert("Error updating role: " + err.message);
    } finally {
      setActionMenuOpen(null);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    return email.substring(0, 2).toUpperCase();
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      (client.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1">Client Management</h2>
          <p className="text-[var(--text-secondary)]">View and manage client profiles, roles, and status.</p>
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
              placeholder="Search clients by name or email..." 
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
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="rejected">Rejected</option>
            </select>
            <Filter className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex justify-center py-20 relative z-10">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-secondary)] border-2 border-dashed border-gray-200/60 rounded-3xl relative z-10 bg-white/30 backdrop-blur-sm">
            No clients match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Client</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Contact</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Role</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/60 transition-all duration-200 group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 text-black font-bold flex items-center justify-center rounded-full text-sm shrink-0 shadow-sm border border-gray-200/50">
                          {getInitials(client.full_name, client.email)}
                        </div>
                        <div className="font-bold text-black">{client.full_name || "Unnamed"}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                        <Mail className="w-4 h-4 text-gray-400" /> {client.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        client.role === 'admin' ? 'bg-purple-50/80 border-purple-100 text-purple-700' :
                        client.role === 'client' ? 'bg-blue-50/80 border-blue-100 text-blue-700' : 
                        'bg-gray-50/80 border-gray-100 text-gray-700'
                      }`}>
                        {client.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        client.status === 'active' ? 'bg-green-50/80 border-green-100 text-green-700' : 
                        'bg-red-50/80 border-red-100 text-red-700'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button 
                        onClick={() => setActionMenuOpen(actionMenuOpen === client.id ? null : client.id)}
                        className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-white shadow-sm opacity-50 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {actionMenuOpen === client.id && (
                        <div className="absolute right-8 top-10 w-56 bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200 divide-y divide-gray-50">
                          
                          <div className="py-1">
                            {client.role !== 'admin' && (
                              <button 
                                onClick={() => updateRole(client.id, 'admin')}
                                className="w-full px-4 py-2 text-left text-sm font-bold text-purple-700 hover:bg-purple-50/50 flex items-center gap-3 transition-colors"
                              >
                                <Shield className="w-4 h-4" /> Make Admin
                              </button>
                            )}
                            {client.role !== 'client' && (
                              <button 
                                onClick={() => updateRole(client.id, 'client')}
                                className="w-full px-4 py-2 text-left text-sm font-bold text-blue-700 hover:bg-blue-50/50 flex items-center gap-3 transition-colors"
                              >
                                <UserIcon className="w-4 h-4" /> Make Client
                              </button>
                            )}
                          </div>

                          <div className="py-1">
                            {client.status === 'active' ? (
                              <button 
                                onClick={() => updateStatus(client.id, 'banned')}
                                className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50/50 flex items-center gap-3 transition-colors"
                              >
                                <UserX className="w-4 h-4" /> Ban User
                              </button>
                            ) : (
                              <button 
                                onClick={() => updateStatus(client.id, 'active')}
                                className="w-full px-4 py-2 text-left text-sm font-bold text-green-600 hover:bg-green-50/50 flex items-center gap-3 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" /> Reactivate User
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

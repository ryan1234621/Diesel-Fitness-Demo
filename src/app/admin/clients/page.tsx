"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Mail, Loader2, Eye, Edit, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
};

export default function ClientsManagement() {
  const { user: currentUser } = useAuth();
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Modal states
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    role: "",
    status: ""
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
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

  const handleOpenViewModal = (client: Profile) => {
    setSelectedClient(client);
    setEditFormData({
      full_name: client.full_name || "",
      role: client.role,
      status: client.status
    });
    setIsEditing(false);
    setIsViewModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editFormData.full_name.trim(),
          role: editFormData.role,
          status: editFormData.status
        })
        .eq("id", selectedClient.id);

      if (error) throw error;

      const updatedClient = {
        ...selectedClient,
        full_name: editFormData.full_name.trim(),
        role: editFormData.role,
        status: editFormData.status
      };

      setClients(clients.map(c => c.id === selectedClient.id ? updatedClient : c));
      setSelectedClient(updatedClient);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert("Error updating profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (currentUser && id === currentUser.id) {
      alert("You cannot delete your own profile.");
      return;
    }
    if (!confirm("Are you sure you want to delete this profile?")) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      setClients(clients.filter(c => c.id !== id));
      setIsViewModalOpen(false);
      setSelectedClient(null);
    } catch (err: any) {
      console.error("Error deleting profile:", err);
      alert("Error deleting profile: " + err.message);
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
    const matchesRole = roleFilter === "all" || client.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex items-center justify-center gap-2 pl-6 pr-10 py-3 border border-gray-200/60 rounded-xl font-bold hover:bg-gray-50/50 transition-colors appearance-none bg-white/50 backdrop-blur-sm min-w-[150px] shadow-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
              <option value="user">User</option>
            </select>
            <Filter className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex items-center justify-center gap-2 pl-6 pr-10 py-3 border border-gray-200/60 rounded-xl font-bold hover:bg-gray-50/50 transition-colors appearance-none bg-white/50 backdrop-blur-sm min-w-[150px] shadow-sm"
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
                  <tr 
                    key={client.id} 
                    onClick={() => handleOpenViewModal(client)}
                    className="hover:bg-white/60 transition-all duration-200 group cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 text-black font-bold flex items-center justify-center rounded-full text-sm shrink-0 shadow-sm border border-gray-200/50">
                          {getInitials(client.full_name, client.email)}
                        </div>
                        <div className="font-bold text-black flex items-center gap-2">
                          {client.full_name || "Unnamed"}
                          {currentUser && client.id === currentUser.id && (
                            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase rounded-full tracking-wide">You</span>
                          )}
                        </div>
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
                    <td className="py-4 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenViewModal(client)}
                        className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-white shadow-sm"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View/Edit Modal */}
      {isViewModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-white/20 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isEditing ? (
              <div>
                <h2 className="text-2xl font-black mb-6">Edit Profile</h2>
                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
                    >
                      <option value="user">User</option>
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
                    >
                      <option value="active">Active</option>
                      <option value="banned">Banned</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md flex justify-center items-center gap-2"
                    >
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-gray-100 text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 text-black font-bold flex items-center justify-center rounded-full text-2xl shadow-sm border border-gray-200/50">
                    {getInitials(selectedClient.full_name, selectedClient.email)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black">{selectedClient.full_name || "Unnamed Client"}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedClient.email}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm font-bold text-[var(--text-secondary)]">Role</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                      selectedClient.role === 'admin' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                      selectedClient.role === 'client' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                      'bg-gray-50 border-gray-100 text-gray-700'
                    }`}>
                      {selectedClient.role}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm font-bold text-[var(--text-secondary)]">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                      selectedClient.status === 'active' ? 'bg-green-50 border-green-100 text-green-700' : 
                      'bg-red-50 border-red-100 text-red-700'
                    }`}>
                      {selectedClient.status}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm font-bold text-[var(--text-secondary)]">Created At</span>
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(selectedClient.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditFormData({
                        full_name: selectedClient.full_name || "",
                        role: selectedClient.role,
                        status: selectedClient.status
                      });
                      setIsEditing(true);
                    }}
                    className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                  {currentUser && selectedClient.id !== currentUser.id ? (
                    <button
                      onClick={() => handleDelete(selectedClient.id)}
                      className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100"
                    >
                      <Trash2 className="w-4 h-4" /> Delete User
                    </button>
                  ) : (
                    <button
                      disabled
                      title="You cannot delete your own account"
                      className="flex-1 py-3 bg-gray-50 text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-gray-200/50 cursor-not-allowed opacity-60"
                    >
                      <Trash2 className="w-4 h-4" /> Delete User
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

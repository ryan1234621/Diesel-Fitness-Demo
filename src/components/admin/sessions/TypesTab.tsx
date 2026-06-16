"use client";

import { useState, useEffect, useRef } from "react";
import { Edit2, Trash2, Plus, Loader2, X, Image as ImageIcon, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SessionType = {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  max_slots: number;
  location: string;
  image_url: string | null;
  is_active: boolean;
  categories?: { name: string };
};

type Category = {
  id: string;
  name: string;
};

export function TypesTab() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<SessionType | null>(null);
  
  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    description: "",
    duration_minutes: 60,
    price: 0,
    max_slots: 15,
    location: "On Premises"
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories for the dropdown
      const { data: catData, error: catError } = await supabase.from("categories").select("id, name").order("name");
      if (catError) throw catError;
      setCategories(catData || []);

      // Fetch session types with category names
      const { data: typeData, error: typeError } = await supabase
        .from("session_types")
        .select(`*, categories(name)`)
        .order("title");
      
      if (typeError) throw typeError;
      setSessionTypes(typeData || []);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (sessionType?: SessionType) => {
    if (sessionType) {
      setEditingType(sessionType);
      setFormData({
        category_id: sessionType.category_id || "",
        title: sessionType.title,
        description: sessionType.description || "",
        duration_minutes: sessionType.duration_minutes,
        price: sessionType.price,
        max_slots: sessionType.max_slots,
        location: sessionType.location
      });
      setImagePreview(sessionType.image_url);
    } else {
      setEditingType(null);
      setFormData({
        category_id: categories.length > 0 ? categories[0].id : "",
        title: "",
        description: "",
        duration_minutes: 60,
        price: 0,
        max_slots: 15,
        location: "On Premises"
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!formData.category_id) throw new Error("Please select a category.");

      let finalImageUrl = editingType?.image_url || null;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('session_images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('session_images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        ...formData,
        category_id: formData.category_id === "" ? null : formData.category_id,
        image_url: finalImageUrl
      };

      if (editingType) {
        const { error: updateError } = await supabase
          .from("session_types")
          .update(payload)
          .eq("id", editingType.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("session_types")
          .insert([payload]);
        
        if (insertError) throw insertError;
      }
      
      await fetchData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template? Scheduled sessions using this template will be affected.")) return;
    
    try {
      const { error } = await supabase.from("session_types").delete().eq("id", id);
      if (error) throw error;
      setSessionTypes(sessionTypes.filter(s => s.id !== id));
    } catch (err: any) {
      console.error("Error deleting template:", err);
      alert("Error deleting template: " + err.message);
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
          New Template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : sessionTypes.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)] border-2 border-dashed border-gray-200 rounded-3xl">
          No templates found. Create one to get started!
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Title & Image</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Category</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Details</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider">Price</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessionTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      {type.image_url ? (
                        <img src={type.image_url} alt={type.title} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-black">{type.title}</div>
                        <div className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">{type.description || "No description"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 bg-[#F4F3EF] rounded-md text-xs font-bold text-black">
                      {type.categories?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">{type.duration_minutes} mins</div>
                    <div className="text-xs text-[var(--text-secondary)]">Max {type.max_slots} slots</div>
                  </td>
                  <td className="py-4 px-6 font-black text-green-600">${Number(type.price).toFixed(2)}</td>
                  <td className="py-4 px-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(type)} className="p-2 text-gray-400 hover:text-black transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(type.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-xl relative my-8">
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-black mb-6">
              {editingType ? "Edit Template" : "New Template"}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative group"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-bold">Click to upload image</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Duration (mins)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Slots</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.max_slots}
                    onChange={(e) => setFormData({ ...formData, max_slots: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingType ? "Save Changes" : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Loader2, X, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenViewModal = (category: Category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || "" });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingCategory) {
        const { error: updateError } = await supabase
          .from("categories")
          .update({ name: formData.name, description: formData.description })
          .eq("id", editingCategory.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("categories")
          .insert([{ name: formData.name, description: formData.description }]);
        
        if (insertError) throw insertError;
      }
      
      await fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? Session types under it may be affected.")) return;
    
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      setIsViewModalOpen(false);
      setSelectedCategory(null);
    } catch (err: any) {
      console.error("Error deleting category:", err);
      alert("Error deleting category: " + err.message);
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
          New Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)] border-2 border-dashed border-gray-200 rounded-3xl">
          No categories found. Create one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              onClick={() => handleOpenViewModal(category)}
              className="border border-gray-100 bg-[#F4F3EF]/60 hover:bg-white/60 p-6 rounded-2xl relative group cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => handleOpenViewModal(category)}
                  className="p-2 bg-white rounded-full text-gray-400 hover:text-black shadow-sm transition-colors"
                >
                  <Eye className="w-4.5 h-4.5" />
                </button>
              </div>
              <h3 className="font-black text-xl mb-2 pr-8 text-black">{category.name}</h3>
              {category.description && (
                <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">{category.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl relative animate-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-black mb-6">
              {editingCategory ? "Edit Category" : "New Category"}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="e.g. High Intensity"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
                  placeholder="Brief description..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {isViewModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-white/20 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <button 
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedCategory(null);
              }}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black mb-1">Category Details</h2>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category Name</h3>
                <div className="font-black text-xl text-black">{selectedCategory.name}</div>
              </div>

              {selectedCategory.description && (
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedCategory.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenModal(selectedCategory);
                  }}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-black font-bold rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Category
                </button>
                <button
                  onClick={() => handleDelete(selectedCategory.id)}
                  className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all text-sm shadow-sm"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  Delete Category
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAdminStore } from '@/store/adminStore';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  AlertTriangle,
  Upload,
  X,
  Sparkles
} from 'lucide-react';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const {
    products,
    loadingProducts,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  } = useAdminStore();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const initialForm: ProductForm = {
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    category: '',
    isActive: true,
  };
  
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [formErrors, setFormErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlWarning, setUrlWarning] = useState<string | null>(null);

  const imagePresets = [
    {
      name: 'Wireless Noise-Canceling Headphones',
      category: 'Electronics',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80&fm=jpg',
    },
    {
      name: 'Mechanical Gaming Keyboard',
      category: 'Electronics',
      url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80&fm=jpg',
    },
    {
      name: 'Ergonomic Office Chair',
      category: 'Furniture',
      url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80&fm=jpg',
    },
    {
      name: 'Smart Fitness Tracker',
      category: 'Electronics',
      url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80&fm=jpg',
    },
    {
      name: 'Stainless Steel Water Bottle',
      category: 'Lifestyle',
      url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80&fm=jpg',
    },
    {
      name: 'Curved Gaming Monitor',
      category: 'Electronics',
      url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80&fm=jpg',
    },
    {
      name: 'Modern Office Lamp',
      category: 'Furniture',
      url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80&fm=jpg',
    },
    {
      name: 'Premium Leather Backpack',
      category: 'Lifestyle',
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80&fm=jpg',
    },
    {
      name: 'Wireless Ergonomic Mouse',
      category: 'Electronics',
      url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80&fm=jpg',
    }
  ];

  const checkUrlWarning = (url: string) => {
    if (!url) {
      setUrlWarning(null);
      return;
    }
    const isGoogleSearch = url.includes('google.com/imgres') || url.includes('images.google');
    const hasImageExtension = /\.(jpeg|jpg|gif|png|webp|svg)/i.test(url) || url.includes('unsplash.com/photo-') || url.includes('images.unsplash.com');
    
    if (isGoogleSearch) {
      setUrlWarning('⚠️ Caution: This appears to be a Google Images search page, NOT a direct image link. Meta WhatsApp API will REJECT the message if the URL is not a direct image.');
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setUrlWarning('⚠️ Absolute URL required (e.g. starting with https://).');
    } else if (!hasImageExtension) {
      setUrlWarning('⚠️ Warning: This URL might not point to a direct image file. Ensure it is a raw image (.jpg, .png, etc.) so it displays properly on real WhatsApp devices.');
    } else {
      setUrlWarning(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Prepend window.location.origin to make it an absolute URL for absolute URL validation
        const absoluteUrl = `${window.location.origin}${data.url}`;
        setForm((prev) => ({ ...prev, imageUrl: absoluteUrl }));
        setUrlWarning(null);
      } else {
        setUploadError(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload image due to connection error.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchProducts(search);
  }, [fetchProducts, search]);

  const handleOpenAdd = () => {
    setForm(initialForm);
    setFormErrors({});
    setEditingId(null);
    setModalOpen(true);
    setUploadError(null);
    setUrlWarning(null);
  };

  const handleOpenEdit = (prod: any) => {
    setForm({
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: String(prod.price),
      stock: String(prod.stock),
      imageUrl: prod.imageUrl,
      category: prod.category,
      isActive: prod.isActive,
    });
    setFormErrors({});
    setEditingId(prod.id);
    setModalOpen(true);
    setUploadError(null);
    if (prod.imageUrl) {
      checkUrlWarning(prod.imageUrl);
    } else {
      setUrlWarning(null);
    }
  };

  const handleToggleStatus = async (prod: any) => {
    const updated = {
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: Number(prod.price),
      stock: Number(prod.stock),
      imageUrl: prod.imageUrl,
      category: prod.category,
      isActive: !prod.isActive,
    };
    await updateProduct(prod.id, updated as any);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? Historical orders will soft-deactivate instead.')) {
      await deleteProduct(id);
    }
  };

  // Auto-generate Slug based on product Name
  const handleNameChange = (nameVal: string) => {
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setForm((prev) => ({ ...prev, name: nameVal, slug: slugVal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    const formattedProduct = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock, 10) || 0,
      imageUrl: form.imageUrl,
      category: form.category,
      isActive: form.isActive,
    };

    let result;
    if (editingId) {
      result = await updateProduct(editingId, formattedProduct as any);
    } else {
      result = await addProduct(formattedProduct as any);
    }

    if (result.success) {
      setModalOpen(false);
      setForm(initialForm);
    } else {
      setFormErrors(result.errors || {});
    }
    setSubmitting(false);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">Out of Stock</span>;
    if (stock <= 5) return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">Low Stock: {stock}</span>;
    return <span className="text-slate-300 font-bold">{stock} Units</span>;
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Top Header Actions row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-900">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search products catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-2xl pl-10 pr-4 text-white text-xs outline-none transition-colors"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* 2. CATALOG CONTAINER */}
        {loadingProducts ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-850 rounded-3xl p-12 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
            <div>
              <h4 className="font-bold text-white text-sm">No Products Found</h4>
              <p className="text-xs text-slate-400">Add a new item to populate the catalogue or adjust your search.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-slate-900/60 border border-slate-850 rounded-3xl overflow-hidden shadow-xl flex flex-col group transition-transform duration-200 hover:-translate-y-0.5"
              >
                {/* Image Cover Panel */}
                <div className="relative h-44 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-850">
                  {prod.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-700" />
                  )}
                  {/* Category overlay */}
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-800">
                    {prod.category}
                  </span>
                </div>

                {/* Content Panel */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm leading-tight group-hover:text-emerald-400 transition-colors">
                      {prod.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">
                      Code: {prod.slug}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {prod.description}
                  </p>

                  <div className="flex justify-between items-center border-y border-slate-850 py-3">
                    <div className="text-xs">
                      <p className="text-slate-500 font-semibold mb-0.5">Price</p>
                      <span className="text-base font-black text-white">₹{Number(prod.price).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs text-right">
                      <p className="text-slate-500 font-semibold mb-0.5">Inventory</p>
                      {getStockBadge(prod.stock)}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Active toggle button */}
                    <button
                      onClick={() => handleToggleStatus(prod)}
                      className="flex items-center space-x-1 text-[10px] font-bold uppercase text-slate-400 hover:text-white transition-colors"
                    >
                      {prod.isActive ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-500">Inactive</span>
                        </>
                      )}
                    </button>

                    {/* Edit & Delete Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="w-8 h-8 bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 rounded-xl flex items-center justify-center transition-colors active:scale-90"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="w-8 h-8 bg-slate-950 border border-slate-850 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 rounded-xl flex items-center justify-center transition-colors active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* 3. CRUD INTERACTIVE OVERLAY MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Glass Overlay */}
            <div 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setModalOpen(false)}
            />

            {/* Modal Body Card */}
            <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto z-10 animate-scale-up">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-extrabold text-white text-base">
                    {editingId ? 'Edit Store Item' : 'Register Store Item'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Item Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-white text-xs outline-none transition-colors"
                      placeholder="e.g. Mechanical Gaming Keyboard"
                    />
                    {formErrors.name && <p className="text-[10px] text-rose-400 font-bold">{formErrors.name[0]}</p>}
                  </div>

                  {/* Slug / Code word field (Readonly automatic mapping) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">WhatsApp Keyword</label>
                    <input
                      type="text"
                      required
                      value={form.slug}
                      onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      className="w-full h-11 bg-slate-950/70 border border-slate-850 text-slate-400 font-mono font-bold rounded-xl px-4 text-[10px] outline-none"
                      placeholder="e.g. keyboard"
                    />
                    {formErrors.slug && <p className="text-[10px] text-rose-400 font-bold">{formErrors.slug[0]}</p>}
                  </div>

                  {/* Category Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</label>
                    <input
                      type="text"
                      required
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-white text-xs outline-none"
                      placeholder="e.g. Electronics"
                    />
                    {formErrors.category && <p className="text-[10px] text-rose-400 font-bold">{formErrors.category[0]}</p>}
                  </div>

                  {/* Price Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Price (INR)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                      className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-white text-xs outline-none"
                      placeholder="e.g. 4999"
                    />
                    {formErrors.price && <p className="text-[10px] text-rose-400 font-bold">{formErrors.price[0]}</p>}
                  </div>

                  {/* Stock Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Initial Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                      className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-white text-xs outline-none"
                      placeholder="e.g. 30"
                    />
                    {formErrors.stock && <p className="text-[10px] text-rose-400 font-bold">{formErrors.stock[0]}</p>}
                  </div>

                  {/* Cover Image upload/selection field */}
                  <div className="col-span-2 space-y-3.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Product Cover Image</label>
                    
                    {/* Live Preview & Drag-Drop Uploader area */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Left: Beautiful Preview Frame */}
                      <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 flex items-center justify-center overflow-hidden aspect-[4/3] sm:col-span-1 group">
                        {form.imageUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={form.imageUrl}
                              alt="Product upload preview"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={() => setUrlWarning('⚠️ Warning: Failed to load image preview. Please verify this is a valid image URL.')}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setForm(prev => ({ ...prev, imageUrl: '' }));
                                setUrlWarning(null);
                              }}
                              className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-450 text-slate-950 p-1.5 rounded-lg transition-transform active:scale-90 z-10"
                              title="Clear image"
                            >
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-1.5" />
                            <span className="text-[10px] text-slate-500 font-bold block">NO PREVIEW</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Drag-Drop Upload Area */}
                      <div className="sm:col-span-2 flex flex-col justify-between space-y-3">
                        <div className="relative border border-dashed border-slate-800 hover:border-emerald-500/35 rounded-2xl bg-slate-950/40 p-4 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group min-h-[100px] h-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                          />
                          {uploading ? (
                            <div className="space-y-1.5">
                              <Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" />
                              <p className="text-[10px] font-bold text-slate-400">UPLOADING IMAGE...</p>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <Upload className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors mx-auto" />
                              <div>
                                <p className="text-[10px] font-extrabold text-white leading-normal">
                                  Drag & drop or <span className="text-emerald-400 underline">click to upload</span>
                                </p>
                                <p className="text-[8px] text-slate-500 mt-0.5">JPEG or PNG only (max 5MB)</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {uploadError && (
                          <p className="text-[10px] text-rose-400 font-bold flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{uploadError}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Manual Direct Image URL input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Or Paste Image URL Directly</span>
                      </div>
                      <input
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, imageUrl: e.target.value }));
                          checkUrlWarning(e.target.value);
                        }}
                        className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-white text-xs outline-none transition-colors"
                        placeholder="e.g. https://images.unsplash.com/...w=800"
                      />
                      
                      {urlWarning && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start space-x-2 text-amber-400 text-[10px] leading-relaxed">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{urlWarning}</span>
                        </div>
                      )}

                      {formErrors.imageUrl && <p className="text-[10px] text-rose-400 font-bold">{formErrors.imageUrl[0]}</p>}
                    </div>

                    {/* Premium Unsplash Presets Showcase */}
                    <div className="space-y-2 border-t border-slate-850 pt-3">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">⚡ Quick Premium Presets (Direct Unsplash Links)</span>
                      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                        {imagePresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setForm(prev => ({ ...prev, imageUrl: preset.url }));
                              setUrlWarning(null);
                            }}
                            className={`relative rounded-xl border aspect-square overflow-hidden bg-slate-950 transition-all hover:scale-[1.06] hover:border-emerald-500 active:scale-95 ${
                              form.imageUrl === preset.url ? 'border-emerald-400 ring-1 ring-emerald-400' : 'border-slate-850'
                            }`}
                            title={`Use preset: ${preset.name} (${preset.category})`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/20 hover:bg-transparent" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description Field */}
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Product Description</label>
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl p-4 text-white text-xs outline-none"
                      placeholder="Enter detailed description listing specifications..."
                    />
                    {formErrors.description && <p className="text-[10px] text-rose-400 font-bold">{formErrors.description[0]}</p>}
                  </div>
                </div>

                {/* Submit Row */}
                 <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                  {formErrors.global && (
                    <div className="text-[10px] text-rose-400 font-bold flex items-center space-x-1 mr-auto animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formErrors.global[0]}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-11 bg-slate-950 border border-slate-850 text-slate-400 hover:text-white font-bold px-4 rounded-xl text-xs active:scale-95 flex-shrink-0"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 rounded-xl text-xs flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}

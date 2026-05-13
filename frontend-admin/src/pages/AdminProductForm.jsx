import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, Package, LayoutGrid, 
  Info, Image as ImageIcon, Tag, 
  ShieldCheck, Star, Save, X, 
  UploadCloud, AlertCircle, Trash2,
  Plus, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import FileInput from '../components/FileInput';

const EMPTY_FORM = {
  name: '',
  description: '',
  shortDesc: '',
  categoryId: '',
  price: '',
  mrp: '',
  unit: 'Unit',
  stock: '0',
  lowStockAlert: '10',
  sku: '',
  isFeatured: false,
  tags: '',
  certifications: '',
};

function toArray(input) {
  if (!input || !input.trim()) return [];
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminProductForm() {
  const { slug, id } = useParams();
  const location = useLocation();
  const isEdit = location.pathname.endsWith('/edit');
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const looksLikeUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data || []),
    staleTime: 1000 * 60 * 30,
  });

  const { data: productData, isLoading: loadingProduct } = useQuery({
    queryKey: ['admin-product', id || slug],
    enabled: isEdit && Boolean(id || slug),
    queryFn: async () => {
      if (id) {
        const byId = await api.get('/products/id/' + id);
        return byId.data?.data;
      }
      if (looksLikeUuid(slug)) {
        const byIdFallback = await api.get('/products/id/' + slug);
        return byIdFallback.data?.data;
      }
      const bySlug = await api.get('/products/' + slug);
      return bySlug.data?.data;
    },
    retry: false,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (!productData) return;
    setForm({
      name: productData.name || '',
      description: productData.description || '',
      shortDesc: productData.shortDesc || '',
      categoryId: productData.categoryId || '',
      price: productData.price?.toString() || '',
      mrp: productData.mrp?.toString() || '',
      unit: productData.unit || 'Unit',
      stock: productData.stock?.toString() || '0',
      lowStockAlert: productData.lowStockAlert?.toString() || '10',
      sku: productData.sku || '',
      isFeatured: Boolean(productData.isFeatured),
      tags: Array.isArray(productData.tags) ? productData.tags.join(', ') : '',
      certifications: Array.isArray(productData.certifications) ? productData.certifications.join(', ') : '',
    });

    setImages(
      (productData.images || []).map((img, idx) => ({
        url: img.url,
        publicId: img.publicId,
        altText: img.altText || productData.name || '',
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx,
        isPrimary: Boolean(img.isPrimary),
      }))
    );
  }, [productData]);

  const uploadMut = useMutation({
    mutationFn: async (files) => {
      if (!files?.length) return [];
      const fd = new FormData();
      files.forEach((file) => fd.append('images', file));
      const { data } = await api.post('/uploads/images?folder=products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data?.data || [];
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Asset upload failed'),
  });

  const payload = useMemo(() => ({
    name: form.name.trim(),
    description: form.description.trim(),
    shortDesc: form.shortDesc.trim(),
    categoryId: form.categoryId,
    price: Number(form.price),
    mrp: Number(form.mrp),
    unit: form.unit.trim() || 'Unit',
    stock: Number(form.stock),
    lowStockAlert: Number(form.lowStockAlert),
    sku: form.sku.trim(),
    isFeatured: Boolean(form.isFeatured),
    tags: toArray(form.tags),
    certifications: toArray(form.certifications),
    images: images.map((img, idx) => ({
      url: img.url,
      publicId: img.publicId,
      altText: img.altText || form.name,
      isPrimary: idx === 0,
      sortOrder: idx,
    })),
  }), [form, images]);

  const saveMut = useMutation({
    mutationFn: () => {
      if (isEdit) return api.put('/products/' + productData.id, payload);
      return api.post('/products', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success(isEdit ? 'Catalog item updated' : 'Catalog item created');
      navigate('/products');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to save manifest'),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!payload.name) return toast.error('Asset name required');
    if (!payload.categoryId) return toast.error('Category classification required');
    if (Number.isNaN(payload.price) || payload.price <= 0) return toast.error('Valuation must be greater than 0');
    
    saveMut.mutate();
  };

  const handleUploadSelection = async (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    if (!files.length) return;

    const uploaded = await uploadMut.mutateAsync(files);
    if (!uploaded.length) return;

    setImages((prev) => [
      ...prev,
      ...uploaded.map((img, idx) => ({
        url: img.url,
        publicId: img.publicId,
        altText: form.name || '',
        isPrimary: prev.length === 0 && idx === 0,
        sortOrder: prev.length + idx,
      })),
    ]);

    toast.success('Asset uploaded successfully');
    setSelectedFiles([]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loadingProduct && isEdit) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
       <div className="w-12 h-12 border-4 border-brand-primary/10 border-t-brand-primary rounded-full animate-spin" />
       <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Synchronizing Product Matrix...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
           <Link to="/products" className="p-3.5 rounded-2xl bg-white border border-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-90">
              <ChevronLeft className="w-5 h-5" />
           </Link>
           <div>
              <div className="flex items-center gap-2 mb-1.5">
                 <span className="p-1 rounded-md bg-brand-primary/5 text-brand-primary border border-brand-primary/5">
                    <LayoutGrid className="w-3 h-3" />
                 </span>
                 <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Catalog Intelligence / Product Designer</p>
              </div>
              <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight leading-none">
                 {isEdit ? 'Optimize Asset' : 'Deploy New Asset'}
              </h1>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/products" className="btn-secondary py-3.5 px-8">Discard</Link>
           <button 
             onClick={onSubmit}
             disabled={saveMut.isPending}
             className="btn-primary py-3.5 px-10 flex items-center gap-2 shadow-xl shadow-brand-primary/20"
           >
              {saveMut.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest">{isEdit ? 'Sync Changes' : 'Initialize Asset'}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* General Information */}
          <div className="card p-10 space-y-10">
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-brand-primary/5 text-brand-primary">
                   <Info className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-brand-primary font-display">Core Information</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                   <label className="block text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-3">Asset Title</label>
                   <input 
                     type="text" 
                     className="input-field py-4 px-5 text-sm font-bold bg-brand-surface/30 focus:bg-white shadow-inner transition-all"
                     placeholder="Enter descriptive title..."
                     value={form.name}
                     onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-3">Classification</label>
                   <select 
                     className="input-field py-4 px-5 text-sm font-bold bg-brand-surface/30 focus:bg-white shadow-inner transition-all cursor-pointer"
                     value={form.categoryId}
                     onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                   >
                      <option value="">Select Category</option>
                      {categories?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-3">Serial ID / SKU</label>
                   <input 
                     type="text" 
                     className="input-field py-4 px-5 text-sm font-bold bg-brand-surface/30 focus:bg-white shadow-inner transition-all uppercase tracking-widest"
                     placeholder="UID-0000"
                     value={form.sku}
                     onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                   />
                </div>
             </div>

             <div className="space-y-8">
                <div>
                   <label className="block text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-3">Brief Manifest / Short Desc</label>
                   <input 
                     type="text" 
                     className="input-field py-4 px-5 text-sm font-medium bg-brand-surface/30 focus:bg-white shadow-inner transition-all italic"
                     placeholder="Enter highlight..."
                     value={form.shortDesc}
                     onChange={(e) => setForm((prev) => ({ ...prev, shortDesc: e.target.value }))}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-3">Full Specification Manifest</label>
                   <textarea 
                     rows={6}
                     className="input-field py-4 px-5 text-sm font-medium bg-brand-surface/30 focus:bg-white shadow-inner transition-all leading-relaxed"
                     placeholder="Describe the asset in full detail..."
                     value={form.description}
                     onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                   />
                </div>
             </div>
          </div>

          {/* Visual Assets */}
          <div className="card p-10 space-y-10">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 rounded-2xl bg-brand-primary/5 text-brand-primary">
                      <ImageIcon className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-bold text-brand-primary font-display">Visual Matrix</h3>
                </div>
                <span className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em]">{images.length} Assets Logged</span>
             </div>

             <div className="space-y-6">
                <div className="relative group/upload">
                   <FileInput
                     accept="image/*"
                     multiple
                     onChange={handleUploadSelection}
                     disabled={uploadMut.isPending}
                     selectedFileCount={selectedFiles.length}
                   />
                   {uploadMut.isPending && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-primary/20">
                         <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mb-4" />
                         <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest animate-pulse">Uploading Resources...</p>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {images.map((img, idx) => (
                      <div key={img.publicId + idx} className="relative group/img overflow-hidden rounded-2xl border border-brand-primary/10 shadow-sm bg-white aspect-square hover:shadow-xl transition-all duration-500">
                         <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end gap-3">
                            <button 
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="w-full py-2 bg-red-500/90 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 backdrop-blur-sm hover:bg-red-600 transition-colors"
                            >
                               <Trash2 className="w-3.5 h-3.5" /> Purge Asset
                            </button>
                         </div>
                         {idx === 0 && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-brand-primary text-white text-[8px] font-black uppercase tracking-widest rounded shadow-lg">
                               Primary
                            </div>
                         )}
                      </div>
                   ))}
                   {images.length < 8 && !uploadMut.isPending && (
                      <label className="border-2 border-dashed border-brand-primary/10 rounded-2xl flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-brand-surface/50 hover:border-brand-primary/30 transition-all group">
                         <input type="file" className="hidden" multiple accept="image/*" onChange={handleUploadSelection} />
                         <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary/30 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                            <Plus className="w-5 h-5" />
                         </div>
                         <span className="text-[9px] font-black text-brand-primary/30 uppercase tracking-[0.2em] mt-3 group-hover:text-brand-primary transition-colors">Add Resource</span>
                      </label>
                   )}
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Valuation & Logistics */}
          <div className="card p-8 space-y-8 bg-brand-primary text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
                <CreditCard className="w-24 h-24 transform translate-x-8 -translate-y-8" />
             </div>
             <div className="relative z-10 space-y-8">
                <h3 className="font-black text-white/40 text-[10px] uppercase tracking-[0.3em]">Valuation Protocol</h3>
                
                <div className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Premium Price (INR)</label>
                      <div className="relative">
                         <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 font-bold">₹</span>
                         <input 
                           type="number" 
                           className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-10 pr-5 text-xl font-bold font-display focus:bg-white/20 transition-all outline-none"
                           value={form.price}
                           onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                         />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Standard MRP (INR)</label>
                      <div className="relative">
                         <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 font-bold">₹</span>
                         <input 
                           type="number" 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-5 text-sm font-bold focus:bg-white/10 transition-all outline-none"
                           value={form.mrp}
                           onChange={(e) => setForm((prev) => ({ ...prev, mrp: e.target.value }))}
                         />
                      </div>
                   </div>
                   <div className="h-px bg-white/10 my-8" />
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Available Stock</label>
                         <input 
                           type="number" 
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:bg-white/10 transition-all"
                           value={form.stock}
                           onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                         />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Alert Threshold</label>
                         <input 
                           type="number" 
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:bg-white/10 transition-all"
                           value={form.lowStockAlert}
                           onChange={(e) => setForm((prev) => ({ ...prev, lowStockAlert: e.target.value }))}
                         />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Tagging & Identity */}
          <div className="card p-8 space-y-8">
             <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-brand-secondary/10 text-brand-secondary">
                   <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-brand-primary uppercase tracking-[0.2em]">Identity & Tags</h3>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="block text-[9px] font-black text-brand-text/30 uppercase tracking-widest mb-2">Deployment Tags</label>
                   <input 
                     type="text" 
                     className="input-field py-3 px-4 text-xs bg-brand-surface/30 focus:bg-white transition-all shadow-inner"
                     placeholder="premium, custom, handcrafted..."
                     value={form.tags}
                     onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                   />
                </div>
                <div>
                   <label className="block text-[9px] font-black text-brand-text/30 uppercase tracking-widest mb-2">Certifications</label>
                   <input 
                     type="text" 
                     className="input-field py-3 px-4 text-xs bg-brand-surface/30 focus:bg-white transition-all shadow-inner"
                     placeholder="ISO, Verified..."
                     value={form.certifications}
                     onChange={(e) => setForm((prev) => ({ ...prev, certifications: e.target.value }))}
                   />
                </div>
                <div>
                   <label className="block text-[9px] font-black text-brand-text/30 uppercase tracking-widest mb-2">Logistic Unit</label>
                   <input 
                     type="text" 
                     className="input-field py-3 px-4 text-xs bg-brand-surface/30 focus:bg-white transition-all shadow-inner font-bold"
                     placeholder="kg, pcs, set..."
                     value={form.unit}
                     onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                   />
                </div>
                <div className="pt-4 flex items-center justify-between p-4 bg-brand-surface/50 rounded-2xl border border-brand-primary/5">
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-400 text-white shadow-sm">
                         <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Featured Status</span>
                   </div>
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 rounded-lg border-brand-primary/10 text-brand-primary focus:ring-brand-primary transition-all cursor-pointer"
                     checked={form.isFeatured}
                     onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                   />
                </div>
             </div>
          </div>

          {/* Deployment History (if edit) */}
          {isEdit && (
            <div className="card p-8 bg-brand-surface/50 border-brand-primary/5 shadow-inner">
               <div className="flex items-center gap-3 mb-6">
                  <History className="w-4 h-4 text-brand-text/30" />
                  <h3 className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest">Asset Lifecycle</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                     <span className="text-brand-text/30 uppercase">Initial Entry</span>
                     <span className="text-brand-primary">{new Date(productData?.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                     <span className="text-brand-text/30 uppercase">Last Sync</span>
                     <span className="text-brand-primary">{new Date(productData?.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

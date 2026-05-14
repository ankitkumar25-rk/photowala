import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

const EMPTY_FORM = {
  name: '',
  description: '',
  shortDesc: '',
  categoryId: '',
  price: '',
  mrp: '',
  unit: 'kg',
  stock: '0',
  lowStockAlert: '10',
  sku: '',
  isFeatured: false,
  tags: '',
  certifications: '',
};

function toArray(input) {
  if (!input.trim()) return [];
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
  
  // imageSlots will store either a File object (new upload) or a URL (existing)
  const [imageSlots, setImageSlots] = useState([null, null, null]);
  const [previews, setPreviews] = useState(['', '', '']);

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
      unit: productData.unit || 'kg',
      stock: productData.stock?.toString() || '0',
      lowStockAlert: productData.lowStockAlert?.toString() || '10',
      sku: productData.sku || '',
      isFeatured: Boolean(productData.isFeatured),
      tags: Array.isArray(productData.tags) ? productData.tags.join(', ') : '',
      certifications: Array.isArray(productData.certifications) ? productData.certifications.join(', ') : '',
    });

    const existingImages = productData.images || [];
    const newSlots = [null, null, null];
    const newPreviews = ['', '', ''];

    existingImages.slice(0, 3).forEach((img, idx) => {
      newSlots[idx] = img; // store the image object to retain metadata
      newPreviews[idx] = img.url;
    });

    setImageSlots(newSlots);
    setPreviews(newPreviews);
  }, [productData]);

  const handleFileChange = (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...previews];
      newPreviews[idx] = reader.result;
      setPreviews(newPreviews);

      const newSlots = [...imageSlots];
      newSlots[idx] = file;
      setImageSlots(newSlots);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    const newPreviews = [...previews];
    newPreviews[idx] = '';
    setPreviews(newPreviews);

    const newSlots = [...imageSlots];
    newSlots[idx] = null;
    setImageSlots(newSlots);
  };

  const saveMut = useMutation({
    mutationFn: async (formData) => {
      if (isEdit) return api.put('/products/' + productData.id, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success(isEdit ? 'Product updated' : 'Product created');
      navigate('/products');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to save product'),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.categoryId) return toast.error('Category is required');
    if (Number.isNaN(Number(form.price)) || Number(form.price) <= 0) return toast.error('Price must be greater than 0');
    if (Number.isNaN(Number(form.mrp)) || Number(form.mrp) <= 0) return toast.error('MRP must be greater than 0');
    
    // Primary image check
    if (!imageSlots[0]) return toast.error('Primary image is required');

    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'tags' || key === 'certifications') {
        fd.append(key, toArray(val).join(','));
      } else {
        fd.append(key, val);
      }
    });

    // Handle images
    const existingImagesData = [];
    imageSlots.forEach((slot, idx) => {
      if (slot instanceof File) {
        fd.append('images', slot);
      } else if (slot && typeof slot === 'object' && slot.url) {
        existingImagesData.push({
          url: slot.url,
          publicId: slot.publicId,
          altText: slot.altText || form.name,
          isPrimary: idx === 0,
          sortOrder: idx
        });
      }
    });

    if (existingImagesData.length > 0) {
      // Send existing images as JSON string if any
      fd.append('imagesData', JSON.stringify(existingImagesData));
    }

    saveMut.mutate(fd);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{isEdit ? 'Update product details and stock settings' : 'Create a new catalog item'}</p>
        </div>
        <Link to="/products" className="btn-ghost w-full justify-center sm:w-auto">Back to Products</Link>
      </div>

      <form onSubmit={onSubmit} className="card p-5 space-y-5">
        {loadingProduct && isEdit && <p className="text-sm text-gray-500">Loading product...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <select
              className="input-field"
              value={form.categoryId}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              required
            >
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">MRP</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              value={form.mrp}
              onChange={(e) => setForm((prev) => ({ ...prev, mrp: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={form.stock}
              onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Low Stock Alert</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={form.lowStockAlert}
              onChange={(e) => setForm((prev) => ({ ...prev, lowStockAlert: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">SKU</label>
            <input
              type="text"
              className="input-field"
              value={form.sku}
              onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit</label>
            <input
              type="text"
              className="input-field"
              value={form.unit}
              onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description</label>
          <input
            type="text"
            className="input-field"
            value={form.shortDesc}
            onChange={(e) => setForm((prev) => ({ ...prev, shortDesc: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            rows={4}
            className="input-field"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">Product Images (Up to 3)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {idx === 0 ? 'Primary Image (Required)' : `Image ${idx + 1} (Optional)`}
                </p>
                <div className={`relative aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-gray-50/50 ${previews[idx] ? 'border-brand-primary/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  {previews[idx] ? (
                    <>
                      <img src={previews[idx]} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                      <Upload className="w-6 h-6 text-gray-300 mb-2" />
                      <span className="text-xs font-medium text-gray-500">Click to upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(idx, e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={form.tags}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="premium, custom, handcrafted"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Certifications (comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={form.certifications}
              onChange={(e) => setForm((prev) => ({ ...prev, certifications: e.target.value }))}
              placeholder="ISO, FSSAI"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
            />
            Featured Product
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Link to="/products" className="btn-ghost">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={saveMut.isPending}>
            {saveMut.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

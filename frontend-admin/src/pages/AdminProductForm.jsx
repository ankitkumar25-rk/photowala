import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const looksLikeUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data || []),
    staleTime: 1000 * 60 * 30, // 30 minutes - categories rarely change
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
    staleTime: 1000 * 60, // 1 minute
  });

  useEffect(() => {
    if (!productData) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  useEffect(() => {
    if (!isEdit) return;
    if (loadingProduct) return;
    if (productData) return;
    if (!(id || slug)) return;

    toast.error('Unable to load product details for editing');
  }, [isEdit, loadingProduct, productData, id, slug]);

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
    onError: (err) => toast.error(err?.response?.data?.message || 'Image upload failed'),
  });

  const payload = useMemo(() => ({
    name: form.name.trim(),
    description: form.description.trim(),
    shortDesc: form.shortDesc.trim(),
    categoryId: form.categoryId,
    price: Number(form.price),
    mrp: Number(form.mrp),
    unit: form.unit.trim() || 'kg',
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
      toast.success(isEdit ? 'Product updated' : 'Product created');
      navigate('/products');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to save product'),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!payload.name) return toast.error('Name is required');
    if (!payload.categoryId) return toast.error('Category is required');
    if (Number.isNaN(payload.price) || payload.price <= 0) return toast.error('Price must be greater than 0');
    if (Number.isNaN(payload.mrp) || payload.mrp <= 0) return toast.error('MRP must be greater than 0');
    if (Number.isNaN(payload.stock) || payload.stock < 0) return toast.error('Stock cannot be negative');
    if (Number.isNaN(payload.lowStockAlert) || payload.lowStockAlert < 0) return toast.error('Low stock alert cannot be negative');

    if (isEdit && !productData?.id) {
      toast.error('Product data is still loading');
      return;
    }

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

    toast.success('Image uploaded');
    setSelectedFiles([]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">Product Images</label>
            <span className="text-xs text-gray-400">First image is used as primary</span>
          </div>
          <FileInput
            accept="image/*"
            multiple
            onChange={handleUploadSelection}
            disabled={uploadMut.isPending}
            selectedFileCount={selectedFiles.length}
          />
          {uploadMut.isPending && (
            <p className="text-xs text-gray-500">Uploading {selectedFiles.length || 'selected'} image(s)...</p>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={img.publicId + idx} className="border border-gray-200 rounded-lg p-2 bg-white">
                  <div className="aspect-square rounded-md overflow-hidden bg-gray-100">
                    <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 truncate">{idx === 0 ? 'Primary' : 'Secondary'}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-[11px] font-semibold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

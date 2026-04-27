import api from './client';

export const authApi = {
  register:        (data) => api.post('/auth/register', data),
  login:           (data) => api.post('/auth/login', data),
  logout:          ()     => api.post('/auth/logout'),
  refresh:         ()     => api.post('/auth/refresh'),
  getMe:           ()     => api.get('/auth/me'),
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  resetPassword:   (data) => api.post('/auth/reset-password', data),
};

export const productsApi = {
  list:       (params) => api.get('/products', { params }),
  featured:   ()       => api.get('/products/featured'),
  search:     (q)      => api.get('/products/search', { params: { q } }),
  getBySlug:  (slug)   => api.get(`/products/${slug}`),
  create:     (data)   => api.post('/products', data),
  update:     (id, data) => api.put(`/products/${id}`, data),
  delete:     (id)     => api.delete(`/products/${id}`),
  updateStock:(id, stock) => api.patch(`/products/${id}/stock`, { stock }),
};

export const categoriesApi = {
  list:   ()     => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id)   => api.delete(`/categories/${id}`),
};

export const cartApi = {
  get:     ()     => api.get('/cart'),
  add:     (data) => api.post('/cart/add', data),
  update:  (data) => api.put('/cart/update', data),
  remove:  (data) => api.delete('/cart/remove', { data }),
  clear:   ()     => api.delete('/cart/clear'),
  merge:   ()     => api.post('/cart/merge'),
};

export const ordersApi = {
  create:      (data) => api.post('/orders', data),
  myOrders:    (params) => api.get('/orders', { params }),
  getById:     (id)   => api.get(`/orders/${id}`),
  cancel:      (id)   => api.post(`/orders/${id}/cancel`),
  allOrders:   (params) => api.get('/orders/admin/all', { params }),
  updateStatus:(id, status) => api.patch(`/orders/${id}/status`, { status }),
  updateTracking:(id, trackingNumber) => api.patch(`/orders/${id}/tracking`, { trackingNumber }),
};

export const paymentsApi = {
  createOrder:    (orderId) => api.post('/payments/create-order', { orderId }),
  verifyPayment:  (data)    => api.post('/payments/verify', data),
};

export const usersApi = {
  getProfile:      ()     => api.get('/users/profile'),
  updateProfile:   (data) => api.put('/users/profile', data),
  changePassword:  (data) => api.put('/users/change-password', data),
  getAddresses:    ()     => api.get('/users/addresses'),
  addAddress:      (data) => api.post('/users/addresses', data),
  updateAddress:   (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress:   (id)   => api.delete(`/users/addresses/${id}`),
  setDefaultAddr:  (id)   => api.patch(`/users/addresses/${id}/default`),
  getWishlist:     ()     => api.get('/users/wishlist'),
  addToWishlist:   (productId) => api.post(`/users/wishlist/${productId}`),
  removeWishlist:  (productId) => api.delete(`/users/wishlist/${productId}`),
  addReview:       (data) => api.post('/users/reviews', data),
};

export const adminApi = {
  stats:        ()     => api.get('/admin/dashboard/stats'),
  salesChart:   (days) => api.get('/admin/dashboard/sales', { params: { days } }),
  customers:    (params) => api.get('/admin/customers', { params }),
  customer:     (id)   => api.get(`/admin/customers/${id}`),
  inventory:    ()     => api.get('/admin/inventory'),
  lowStock:     ()     => api.get('/admin/inventory/low-stock'),
};

export const uploadApi = {
  uploadImage:  (file, folder) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post(`/uploads/image${folder ? `?folder=${folder}` : ''}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (publicId) => api.delete(`/uploads/image/${encodeURIComponent(publicId)}`),
};

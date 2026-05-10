import { useState, useEffect, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, MapPin, Heart, Package, ChevronRight,
  Edit2, Trash2, Plus, Check, Star, LogOut, Camera,
  Phone, Mail, Shield, Home, Briefcase, X, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import { usersApi, ordersApi } from '../api';

const TABS = [
  { id: 'profile',   label: 'Profile',   icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security',  label: 'Security',  icon: Lock },
  { id: 'wishlist',  label: 'Wishlist',  icon: Heart },
  { id: 'services',  label: 'Services Ledger', icon: Settings },
];

/* â”€â”€ Status badge â”€â”€ */
function StatusBadge({ status }) {
  const map = {
    PENDING:    { bg: 'bg-[#b88a2f]', text: 'text-white', label: 'Pending' },
    CONFIRMED:  { bg: 'bg-blue-500', text: 'text-white', label: 'Confirmed' },
    PROCESSING: { bg: 'bg-purple-500', text: 'text-white', label: 'Processing' },
    SHIPPED:    { bg: 'bg-indigo-500', text: 'text-white', label: 'Shipped' },
    DELIVERED:  { bg: 'bg-green-500', text: 'text-white', label: 'Delivered' },
    CANCELLED:  { bg: 'bg-red-500', text: 'text-white', label: 'Cancelled' },
    REFUNDED:   { bg: 'bg-gray-500', text: 'text-white', label: 'Refunded' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

/* â”€â”€ Address card â”€â”€ */
function AddressCard({ addr, onEdit, onDelete, onSetDefault }) {
  return (
    <div className={`relative p-4 rounded-2xl border-2 transition-all ${
      addr.isDefault ? 'border-brand-secondary bg-brand-surface' : 'border-cream-300 bg-white hover:border-brand-secondary'
    }`}>
      {addr.isDefault && (
        <span className="absolute top-3 right-3 badge-featured text-[10px]">
          <Check className="w-3 h-3" /> Default
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          addr.isDefault ? 'bg-brand-primary/10' : 'bg-cream-200'
        }`}>
          {addr.label === 'Work' ? (
            <Briefcase className="w-4 h-4 text-brand-primary" />
          ) : (
            <Home className="w-4 h-4 text-brand-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{addr.label} — {addr.fullName}</p>
          <p className="text-sm text-gray-600 mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
          <p className="text-sm text-gray-600">{addr.city}, {addr.state} —œ {addr.pincode}</p>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <Phone className="w-3 h-3" /> {addr.phone}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cream-200">
        {!addr.isDefault && (
          <button
            onClick={() => onSetDefault(addr.id)}
            className="text-xs font-semibold text-brand-primary hover:text-brand-primary px-2 py-1 rounded-lg hover:bg-brand-surface transition-colors"
          >
            Set as Default
          </button>
        )}
        <button
          onClick={() => onEdit(addr)}
          className="ml-auto btn-ghost py-1 px-2 text-xs gap-1"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={() => onDelete(addr.id)}
          className="btn-ghost py-1 px-2 text-xs text-red-500 hover:bg-red-50 gap-1"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}

/* â”€â”€ Address modal â”€â”€ */
function AddressModal({ addr, onClose, onSave }) {
  const [form, setForm] = useState(
    addr || { label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false }
  );
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h3 className="font-bold text-xl text-gray-900">
            {addr ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Label */}
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map((l) => (
              <button
                key={l} type="button"
                onClick={() => setForm((f) => ({ ...f, label: l }))}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                  form.label === l
                    ? 'border-brand-secondary bg-brand-surface text-brand-primary'
                    : 'border-cream-300 text-gray-500 hover:border-brand-secondary'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handle} required className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Phone *</label>
              <input name="phone" value={form.phone} onChange={handle} required className="input-field" placeholder="9876543210" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Address Line 1 *</label>
            <input name="line1" value={form.line1} onChange={handle} required className="input-field" placeholder="House/Flat No., Street" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Address Line 2</label>
            <input name="line2" value={form.line2} onChange={handle} className="input-field" placeholder="Area, Landmark (optional)" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">City *</label>
              <input name="city" value={form.city} onChange={handle} required className="input-field" placeholder="Mumbai" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">State *</label>
              <input name="state" value={form.state} onChange={handle} required className="input-field" placeholder="Maharashtra" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Pincode *</label>
              <input name="pincode" value={form.pincode} onChange={handle} required maxLength={6} className="input-field" placeholder="400001" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="w-4 h-4 accent-brand-primary rounded"
            />
            <span className="text-sm font-medium text-gray-700">Set as default address</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [tab, setTab] = useState('profile');
  const [profile, setProfile]   = useState({ name: '', phone: '' });
  const [saving, setSaving]     = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addrModal, setAddrModal] = useState(null); // null=closed, 'new'=new, addr obj=edit
  const [wishlist, setWishlist]   = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    if (tab === 'addresses') loadAddresses();
    if (tab === 'wishlist')  loadWishlist();
    if (tab === 'profile')   loadRecentOrders();
    if (tab === 'services')  navigate('/account/services');
  }, [tab]);

  const loadAddresses = async () => {
    try { const { data } = await usersApi.getAddresses(); setAddresses(data.data); } catch (err) { console.error('Failed to load addresses', err); }
  };

  const loadWishlist = async () => {
    try { const { data } = await usersApi.getWishlist(); setWishlist(data.data); } catch (err) { console.error('Failed to load wishlist', err); }
  };

  const loadRecentOrders = async () => {
    try { const { data } = await ordersApi.myOrders({ limit: 3 }); setRecentOrders(data.data); } catch (err) { console.error('Failed to load recent orders', err); }
  };

  /* â”€â”€ Profile save â”€â”€ */
  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.updateProfile(profile);
      await fetchMe();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  /* â”€â”€ Password â”€â”€ */
  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await usersApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwSaving(false); }
  };

  /* â”€â”€ Address actions â”€â”€ */
  const saveAddress = async (form) => {
    try {
      if (addrModal && typeof addrModal === 'object' && addrModal.id) {
        await usersApi.updateAddress(addrModal.id, form);
        toast.success('Address updated!');
      } else {
        await usersApi.addAddress(form);
        toast.success('Address added!');
      }
      setAddrModal(null);
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
      throw err;
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await usersApi.deleteAddress(id);
      toast.success('Address deleted');
      loadAddresses();
    } catch { toast.error('Failed to delete'); }
  };

  const setDefaultAddress = async (id) => {
    try {
      await usersApi.setDefaultAddr(id);
      loadAddresses();
    } catch { toast.error('Failed to set default'); }
  };

  const removeWishlist = async (productId) => {
    try {
      await usersApi.removeWishlist(productId);
      setWishlist((w) => w.filter((i) => i.productId !== productId));
      toast.success('Removed from wishlist');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to remove from wishlist'); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Logged out');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream-100 page-enter">
      {/* Header */}
      <div className="bg-cream-100 text-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-wrap items-center gap-5 justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-[#f43f5e] flex items-center justify-center text-4xl font-normal text-white shadow-sm">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Hello, {user.name?.split(' ')[0]?.toUpperCase()} 👋
                </h1>
                <p className="text-gray-700 flex items-center gap-1.5 mt-1 text-sm">
                  <Mail className="w-4 h-4 text-gray-600" /> {user.email}
                </p>
                {user.phone && (
                  <p className="text-gray-700 flex items-center gap-1.5 mt-0.5 text-sm">
                    <Phone className="w-4 h-4 text-gray-600" /> {user.phone}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[#c26e27] hover:bg-[#a85f22] text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-12 overflow-x-auto pb-2">
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  tab === id
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                {createElement(icon, { className: 'w-4 h-4' })} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* â”€â”€ PROFILE TAB â”€â”€ */}
        {tab === 'profile' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-primary" /> Personal Information
                </h2>
                <form onSubmit={saveProfile} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Full Name</label>
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      className="input-field text-gray-900"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Email</label>
                    <input value={user.email} disabled className="input-field opacity-60 cursor-not-allowed text-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Phone</label>
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="input-field text-gray-900"
                      placeholder="Your phone number"
                    />
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary w-full justify-center mt-4 py-3" style={{ background: '#c26e27', boxShadow: 'none' }}>
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent orders widget */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-primary" /> Recent Orders
                </h3>
                <button onClick={() => navigate('/orders')} className="text-xs font-semibold text-brand-primary hover:text-brand-primary">
                  View all →
                </button>
              </div>
              {recentOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => navigate(`/orders/${o.id}`)}
                      className="w-full text-left p-3 rounded-xl bg-cream-100 hover:bg-brand-surface transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900">{o.orderNumber}</p>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">₹{Number(o.total).toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Services history quick link */}
            <div className="card p-6 bg-brand-primary text-white">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4" /> Machine & Print Services
              </h3>
              <p className="text-xs text-white/80 mb-4">Track your custom printing and laser cutting requests.</p>
              <button 
                onClick={() => navigate('/account/services')}
                className="w-full py-2 bg-white text-brand-primary rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform"
              >
                View Services Ledger
              </button>
            </div>
          </div>
        )}

        {/* â”€â”€ ADDRESSES TAB â”€â”€ */}
        {tab === 'addresses' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl text-gray-900">
                Saved Addresses
              </h2>
              <button onClick={() => setAddrModal('new')} className="btn-primary py-2 px-4 text-sm gap-1.5">
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>
            {addresses.length === 0 ? (
              <div className="card p-12 text-center">
                <MapPin className="w-14 h-14 mx-auto mb-3 text-cream-50/80" />
                <h3 className="font-bold text-gray-800 text-lg mb-1">No addresses saved</h3>
                <p className="text-gray-500 text-sm mb-4">Add a delivery address to speed up checkout</p>
                <button onClick={() => setAddrModal('new')} className="btn-primary">
                  <Plus className="w-4 h-4" /> Add First Address
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {addresses.map((a) => (
                  <AddressCard
                    key={a.id}
                    addr={a}
                    onEdit={(a) => setAddrModal(a)}
                    onDelete={deleteAddress}
                    onSetDefault={setDefaultAddress}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ SECURITY TAB â”€â”€ */}
        {tab === 'security' && (
          <div className="max-w-lg">
            <div className="card p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-primary" /> Change Password
              </h2>
              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Current Password</label>
                  <input
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    required className="input-field" placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">New Password</label>
                  <input
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                    required minLength={8} className="input-field" placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                    required className="input-field" placeholder="Repeat new password"
                  />
                </div>
                {pwForm.newPassword && pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
                  <p className="text-sm text-red-500 font-medium">Passwords do not match</p>
                )}
                <button type="submit" disabled={pwSaving} className="btn-primary w-full justify-center">
                  {pwSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* â”€â”€ WISHLIST TAB â”€â”€ */}
        {tab === 'wishlist' && (
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-6">
              My Wishlist ({wishlist.length})
            </h2>
            {wishlist.length === 0 ? (
              <div className="card p-12 text-center">
                <Heart className="w-14 h-14 mx-auto mb-3 text-cream-50/80" />
                <h3 className="font-bold text-gray-800 text-lg mb-1">Your wishlist is empty</h3>
                <p className="text-gray-500 text-sm mb-4">Save products you love for later</p>
                <button onClick={() => navigate('/products')} className="btn-primary">
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wishlist.map(({ product }) => (
                  <div key={product.id} className="card group">
                    <div className="relative aspect-square bg-cream-100 overflow-hidden">
                      <img
                        src={product.images?.[0]?.url || 'https://placehold.co/300x300/d8f3dc/2d6a4f?text=ðŸ†'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => removeWishlist(product.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</p>
                      <p className="text-brand-primary font-bold mt-1">₹{Number(product.price).toFixed(2)}</p>
                      <button
                        onClick={() => navigate(`/products/${product.slug}`)}
                        className="btn-primary w-full justify-center text-sm py-2 mt-2"
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address Modal */}
      {addrModal !== null && (
        <AddressModal
          addr={typeof addrModal === 'object' ? addrModal : null}
          onClose={() => setAddrModal(null)}
          onSave={saveAddress}
        />
      )}
    </div>
  );
}


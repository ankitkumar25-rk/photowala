import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight,
  Tag, Truck, Package, Gift, ChevronRight, RefreshCw
} from 'lucide-react';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

/* ── Quantity stepper ── */
function QtyControl({ item }) {
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const [loading, setLoading] = useState(false);

  const change = async (newQty) => {
    setLoading(true);
    try {
      if (newQty < 1) await removeItem(item.productId);
      else await updateItem(item.productId, newQty);
    } finally { setLoading(false); }
  };

  return (
    <div className={`flex items-center gap-1 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        onClick={() => change(item.quantity - 1)}
        className="w-8 h-8 rounded-xl border-2 border-cream-300 flex items-center justify-center hover:border-brand-secondary hover:bg-brand-surface transition-all"
      >
        <Minus className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
      <button
        onClick={() => change(item.quantity + 1)}
        className="w-8 h-8 rounded-xl border-2 border-cream-300 flex items-center justify-center hover:border-brand-secondary hover:bg-brand-surface transition-all"
      >
        <Plus className="w-3.5 h-3.5 text-gray-600" />
      </button>
    </div>
  );
}

/* ── Single cart row ── */
function CartItem({ item }) {
  const removeItem = useCartStore((s) => s.removeItem);
  const [removing, setRemoving] = useState(false);

  const img = item.product?.images?.[0];
  const lineTotal = (Number(item.price) * item.quantity).toFixed(2);

  const handleRemove = async () => {
    setRemoving(true);
    await removeItem(item.productId);
    toast.success('Removed from cart');
  };

  return (
    <div className={`flex gap-4 p-5 transition-opacity ${removing ? 'opacity-30' : ''}`}>
      {/* Image */}
      <Link to={`/products/${item.product?.slug}`} className="shrink-0">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-cream-200 border border-cream-300 group-hover:shadow-md transition-shadow">
          {img ? (
            <img src={img.url} alt={item.product?.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🏆</div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product?.slug}`}>
          <h3 className="font-bold text-gray-900 hover:text-brand-primary transition-colors leading-tight line-clamp-2">
            {item.product?.name}
          </h3>
        </Link>
        {item.product?.unit && (
          <p className="text-sm text-gray-500 mt-0.5">{item.product.unit}</p>
        )}
        <p className="text-brand-primary font-bold mt-1">₹{Number(item.price).toFixed(2)}<span className="text-xs font-normal text-gray-400 ml-1">each</span></p>

        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          <QtyControl item={item} />
          <button
            onClick={handleRemove}
            disabled={removing}
            className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="font-bold text-xl text-gray-900">₹{lineTotal}</p>
        {item.quantity > 1 && (
          <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × ₹{Number(item.price).toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton loader ── */
function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-0">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-4 p-5 border-b border-cream-200">
          <div className="w-24 h-24 rounded-2xl bg-cream-200 shrink-0" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-cream-200 rounded w-3/4" />
            <div className="h-3 bg-cream-200 rounded w-1/4" />
            <div className="h-8 bg-cream-200 rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const items     = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotalFn = useCartStore((s) => s.subtotal);
  const user      = useAuthStore((s) => s.user);

  const subtotal = subtotalFn();
  const shipping = subtotal >= 1000 ? 0 : 49;
  const total    = subtotal + shipping;
  const freeShipRemaining = 1000 - subtotal;
  const freeShipProgress  = Math.min((subtotal / 1000) * 100, 100);

  const handleClear = async () => {
    if (!confirm('Clear all items from cart?')) return;
    await clearCart();
    toast.success('Cart cleared');
  };

  return (
    <div className="min-h-screen bg-cream-100 page-enter">
      {/* Page header */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-semibold">Cart</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3" style={{ fontFamily: 'Fraunces, serif' }}>
              <ShoppingCart className="w-8 h-8 text-brand-primary" />
              Your Cart
              {items.length > 0 && (
                <span className="badge-featured text-sm px-3 py-1">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              )}
            </h1>
            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchCart()}
                  className="btn-ghost py-1.5 px-3 text-sm gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button
                  onClick={handleClear}
                  className="btn-ghost py-1.5 px-3 text-sm text-red-500 hover:bg-red-50 gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 card"><CartSkeleton /></div>
            <div className="lg:col-span-2 card h-64 animate-pulse bg-cream-100" />
          </div>
        ) : items.length === 0 ? (
          /* ── Empty state ── */
          <div className="card p-16 text-center max-w-lg mx-auto">
            <div className="text-7xl mb-5">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">Discover our range of premium gifts, trophies, and mementos and start filling your cart.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/products" className="btn-primary">
                <Gift className="w-4 h-4" /> Shop Now
              </Link>
              {user && (
                <Link to="/orders" className="btn-secondary">
                  <Package className="w-4 h-4" /> My Orders
                </Link>
              )}
            </div>

            {/* Quick categories */}
            <div className="mt-10 pt-8 border-t border-cream-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Browse Categories</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  ['🏆 Trophies', '/categories/trophies'],
                  ['🎁 Corporate Gifts', '/categories/corporate-gifts'],
                  ['💎 Momentos', '/categories/momentos'],
                  ['🪄 Personalized Gifts', '/products'],
                ].map(([label, to]) => (
                  <Link key={to} to={to} className="px-3 py-1.5 bg-brand-surface text-brand-primary text-sm font-semibold rounded-xl hover:bg-brand-surface transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* ── Cart items ── */}
            <div className="lg:col-span-3 card overflow-hidden">
              {/* Free shipping progress bar */}
              {shipping > 0 && (
                <div className="px-5 pt-4 pb-3 bg-brand-surface border-b border-brand-secondary">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-brand-secondary flex items-center gap-1.5">
                      <Truck className="w-4 h-4" /> Add ₹{freeShipRemaining.toFixed(0)} more for FREE shipping!
                    </span>
                    <span className="text-brand-secondary font-bold">{Math.round(freeShipProgress)}%</span>
                  </div>
                  <div className="h-2 bg-brand-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-amber-400 to-brand-surface0 rounded-full transition-all duration-500"
                      style={{ width: `${freeShipProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {shipping === 0 && (
                <div className="px-5 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2 text-sm font-semibold text-green-700">
                  <Tag className="w-4 h-4" /> 🎉 You've unlocked FREE shipping!
                </div>
              )}

              {/* Items list */}
              <div className="divide-y divide-cream-200">
                {items.map((item) => (
                  <CartItem key={item.id ?? item.productId} item={item} />
                ))}
              </div>

              {/* Continue shopping */}
              <div className="p-4 border-t border-cream-200 bg-cream-50">
                <Link to="/products" className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary transition-colors">
                  <Gift className="w-4 h-4" /> Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Order summary ── */}
            <div className="lg:col-span-2 space-y-4 sticky top-24">
              <div className="card p-6">
                <h2 className="font-bold text-xl text-gray-900 mb-5" style={{ fontFamily: 'Fraunces, serif' }}>
                  Order Summary
                </h2>

                <div className="space-y-3">
                  {/* Per-item breakdown */}
                  <div className="space-y-2 pb-3 border-b border-cream-200 max-h-52 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id ?? item.productId} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate mr-2 max-w-[60%]">
                          {item.product?.name} × {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900 shrink-0">
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Shipping
                    </span>
                    {shipping === 0 ? (
                      <span className="font-semibold text-green-600 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-900">₹{shipping.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-cream-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-brand-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="mt-4 p-3 bg-brand-surface rounded-xl text-xs text-brand-secondary font-medium flex items-center gap-2 border border-brand-secondary">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    Add ₹{freeShipRemaining.toFixed(0)} more to get FREE shipping on this order
                  </div>
                )}

                {/* CTA */}
                {user ? (
                  <Link to="/checkout" className="btn-primary w-full justify-center mt-5 text-base py-3.5 gap-2">
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="mt-5 space-y-2">
                    <Link
                      to="/login?redirect=/checkout"
                      className="btn-primary w-full justify-center text-base py-3.5 gap-2"
                    >
                      Login to Checkout <ArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-center text-xs text-gray-400">
                      or{' '}
                      <Link to="/register" className="text-brand-primary font-semibold hover:underline">
                        create an account
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Trust row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🔒', label: 'Secure\nPayment' },
                  { icon: '🚚', label: 'Fast\nDelivery' },
                  { icon: '↩️', label: 'Easy\nReturns' },
                ].map(({ icon, label }) => (
                  <div key={label} className="card p-3 flex flex-col items-center gap-1.5 text-center">
                    <span className="text-xl">{icon}</span>
                    <p className="text-[10px] font-semibold text-gray-500 leading-tight whitespace-pre-line">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recently continue browsing */}
              <div className="card p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">You might also like</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['🌾 Grains', '/categories/grains-cereals'],
                    ['🫒 Oils', '/categories/cold-pressed-oils'],
                    ['🌶️ Spices', '/categories/spices-masalas'],
                  ].map(([label, to]) => (
                    <Link key={to} to={to} className="px-2.5 py-1 text-xs font-semibold bg-brand-surface text-brand-primary rounded-lg hover:bg-brand-surface transition-colors">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Search, Menu, X, User, Heart } from 'lucide-react';
import { useAuthStore, useCartStore } from '../store';
import { productsApi, usersApi } from '../api';
import { brandAssets } from '../data/assets';

export default function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const itemCount = useCartStore((s) => s.itemCount());

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => usersApi.getWishlist().then((r) => r.data.data),
    enabled: !!user,
  });
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await productsApi.search(searchQuery);
        setSearchResults(data.data || []);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navLinks = [
    { to: '/products', label: 'Shop' },
    { to: '/categories/trophies', label: 'Trophies' },
    { to: '/categories/corporate-gifts', label: 'Corporate Gifts' },
    { to: '/categories/momentos', label: 'Momentos' },
    { to: '/services', label: 'Services' },
  ];

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      isScrolled
        ? 'glass-surface border-brand-primary/20 shadow-[0_10px_30px_-20px_rgba(122,50,24,0.5)]'
        : 'bg-cream-100/90 backdrop-blur-lg border-brand-primary/10'
    }`}>
      {/* Top bar */}
      <div className="bg-[#5a3f2f] text-[#fff6ef] text-xs text-center py-2 font-semibold tracking-wide border-b border-[#d8a45f]/25">
        🚚 Free shipping on orders above ₹999 | 🎁 Personalized gifts crafted for memorable moments
      </div>

      <div className="relative max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-20 md:h-24 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <div className="h-16 md:h-20 flex items-center justify-center">
              <img
                src={brandAssets.logo}
                alt="Photo Wala Gift"
                className="h-12 md:h-14 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((l) => {
              const isActive = location.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={(e) => {
                    if (l.to === '#') e.preventDefault();
                  }}
                  className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-secondary'
                      : 'text-brand-primary hover:bg-brand-surface hover:text-brand-secondary'
                  }`}
                >
                  {l.label}
                  {l.badge && (
                    <span className="absolute -top-1 -right-3 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#d96a22] text-white rounded-md shadow-sm whitespace-nowrap">
                      {l.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="btn-ghost p-2"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              {showSearch && (
                <div className="absolute right-0 top-12 w-[min(92vw,20rem)] bg-cream-50 rounded-2xl shadow-lg border border-brand-primary/20 p-3 z-50">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search premium products..."
                    className="input-field text-sm"
                  />
                  {isSearching && (
                    <p className="mt-2 text-xs text-brand-secondary font-semibold">Searching...</p>
                  )}
                  {searchResults.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                      {searchResults.map((p) => (
                        <Link
                          key={p.id}
                          to={`/products/${p.slug}`}
                          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-surface transition-colors"
                        >
                          {p.images?.[0] && (
                            <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-brand-primary">{p.name}</p>
                            <p className="text-xs text-brand-secondary font-bold">₹{p.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className="btn-ghost p-2 relative hidden sm:flex" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="btn-ghost p-2 relative"
              aria-label="Cart"
              id="cart-link-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-brand-surface transition-colors">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center text-xs font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-brand-primary hidden sm:block">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-12 w-48 bg-cream-50 rounded-2xl shadow-lg border border-brand-primary/20 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/account"  className="block px-4 py-2 text-sm text-brand-primary hover:bg-brand-surface font-medium">My Account</Link>
                  <Link to="/orders"   className="block px-4 py-2 text-sm text-brand-primary hover:bg-brand-surface font-medium">My Orders</Link>
                  <hr className="my-1 border-brand-primary/20" />
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 rounded-3xl px-4 text-sm hidden sm:inline-flex">
                <User className="w-4 h-4" /> Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!isMenuOpen)}
                className="btn-ghost p-2"
                aria-label="Menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full z-40 border-t border-brand-primary/10 bg-cream-50 p-4 shadow-[0_18px_40px_-24px_rgba(91,63,47,0.35)] space-y-2">
            {navLinks.map((l) => {
              const isActive = location.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={(e) => {
                    if (l.to === '#') e.preventDefault();
                    else setMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-secondary'
                      : 'text-brand-primary hover:bg-brand-surface hover:text-brand-secondary'
                  }`}
                >
                  {l.label}
                  {l.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#d96a22] text-white rounded-md shadow-sm whitespace-nowrap">
                      {l.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            {user && (
              <>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-semibold text-brand-primary rounded-lg hover:bg-brand-surface hover:text-brand-secondary transition-colors"
                >
                  My Account
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm font-semibold text-brand-primary rounded-lg hover:bg-brand-surface hover:text-brand-secondary transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User, Heart } from 'lucide-react';
import { useAuthStore, useCartStore } from '../store';
import { productsApi } from '../api';
import { brandAssets } from '../data/assets';
import { useWishlist } from '../contexts/WishlistContext';

export default function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const logout = useAuthStore((s) => s.logout);
  const itemCount = useCartStore((s) => s.itemCount());

  const { wishlistCount } = useWishlist();

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

  const headerClass = `sticky top-0 z-50 border-b transition-all duration-300 ${
    isScrolled
      ? 'glass-surface border-brand-primary/20 shadow-[0_10px_30px_-20px_rgba(122,50,24,0.5)]'
      : 'bg-cream-100/90 backdrop-blur-lg border-brand-primary/10'
  }`;

  return (
    <header className={headerClass}>
      {/* Top bar */}
      <div className="bg-[#5a3f2f] text-[#fff6ef] text-[10px] sm:text-xs text-center py-2 px-4 font-semibold tracking-wide border-b border-[#d8a45f]/25">
        <span className="hidden sm:inline">Free shipping on orders above ₹999 | </span>
        Personalized gifts crafted for memorable moments
      </div>

      <div className="relative max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-20 md:h-24 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <div className="h-12 md:h-20 flex items-center justify-center">
              <img
                src={brandAssets.logo}
                alt="Photo Wala Gift"
                className="h-10 md:h-16 w-auto object-contain"
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
                  className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center ${isActive
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
                className={`btn-ghost p-2 transition-colors ${showSearch ? 'bg-brand-surface text-brand-secondary' : ''}`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {showSearch && (
                <>
                  {/* Backdrop for mobile */}
                  <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] md:hidden"
                    onClick={() => setShowSearch(false)}
                  />
                  
                  <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-4 md:top-14 w-auto md:w-96 bg-cream-50 rounded-2xl shadow-[0_20px_50px_rgba(122,50,24,0.15)] border border-brand-primary/20 p-3 md:p-4 z-[100] animate-in fade-in zoom-in-95 slide-in-from-top-4 md:slide-in-from-top-2 duration-300 origin-top-right">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40" />
                        <input
                          autoFocus
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search premium products..."
                          className="input-field pl-10 text-sm bg-white"
                        />
                      </div>
                      <button 
                        onClick={() => setShowSearch(false)}
                        className="md:hidden p-2 text-xs font-bold text-brand-secondary uppercase tracking-wider"
                      >
                        Close
                      </button>
                    </div>

                    {isSearching && (
                      <div className="flex items-center gap-2 px-2 py-4">
                        <div className="w-4 h-4 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-brand-secondary font-semibold">Searching premium collection...</p>
                      </div>
                    )}

                    {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                      <div className="px-2 py-6 text-center">
                        <p className="text-sm text-gray-500 font-medium italic">No products found for "{searchQuery}"</p>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="space-y-1 max-h-[60vh] md:max-h-80 overflow-y-auto custom-scrollbar pr-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Products</p>
                        {searchResults.map((p) => (
                          <Link
                            key={p.id}
                            to={`/products/${p.slug}`}
                            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                            className="flex items-center gap-4 p-2 rounded-xl hover:bg-brand-surface transition-all duration-200 group border border-transparent hover:border-brand-primary/10"
                          >
                            <div className="relative shrink-0 overflow-hidden rounded-lg border border-cream-200">
                              {p.images?.[0] ? (
                                <img src={p.images[0].url} alt={p.name} className="w-12 h-12 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                              ) : (
                                <div className="w-12 h-12 bg-cream-100 flex items-center justify-center text-xl">📦</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-brand-primary truncate group-hover:text-brand-secondary transition-colors">{p.name}</p>
                              <p className="text-xs text-brand-secondary font-bold mt-0.5">₹{p.price}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-secondary group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className="btn-ghost p-2 relative hidden md:flex" aria-label="Wishlist">
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
            <div className="hidden md:flex items-center">
              {isHydrating ? (
                <div className="w-8 h-8 bg-brand-primary/10 rounded-full" />
              ) : user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-brand-surface transition-colors">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center text-xs font-bold">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-brand-primary hidden sm:block">{user.name?.split(' ')[0] || 'User'}</span>
                  </button>
                  <div className="absolute right-0 top-12 w-48 bg-cream-50 rounded-2xl shadow-lg border border-brand-primary/20 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/account" className="block px-4 py-2 text-sm text-brand-primary hover:bg-brand-surface font-medium">My Account</Link>
                    {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                      <a href="https://photowala-three.vercel.app/admin" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-brand-secondary hover:bg-brand-surface font-bold">Admin Panel</a>
                    )}
                    <Link to="/orders" className="block px-4 py-2 text-sm text-brand-primary hover:bg-brand-surface font-medium">My Orders</Link>
                    <Link to="/account/services" className="block px-4 py-2 text-sm text-brand-primary hover:bg-brand-surface font-medium">My Services</Link>
                    <hr className="my-1 border-brand-primary/20" />
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Logout</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn-primary py-2 rounded-3xl px-4 text-xs">
                  <User className="w-4 h-4" /> Login
                </Link>
              )}
            </div>

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
          <div className="md:hidden fixed inset-0 top-0 left-0 w-full h-screen z-100 bg-cream-50 p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <img src={brandAssets.logo} alt="Logo" className="h-12 w-auto" />
              <button onClick={() => setMenuOpen(false)} className="p-2 bg-cream-200 rounded-full">
                <X className="w-6 h-6 text-brand-primary" />
              </button>
            </div>
            <div className="space-y-4">
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
                    className={`flex items-center justify-between px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isActive
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
              {!isHydrating && user && (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-brand-primary rounded-lg hover:bg-brand-surface hover:text-brand-secondary transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-brand-primary rounded-lg hover:bg-brand-surface hover:text-brand-secondary transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/account/services"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-brand-primary rounded-lg hover:bg-brand-surface hover:text-brand-secondary transition-colors"
                  >
                    My Services
                  </Link>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              {!isHydrating && !user && (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-semibold text-brand-primary rounded-lg hover:bg-brand-surface hover:text-brand-secondary transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

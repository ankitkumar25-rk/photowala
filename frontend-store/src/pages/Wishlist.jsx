import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Trash2, ArrowLeft, ChevronRight, ShoppingBag, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '../api';
import { useAuthStore } from '../store';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => usersApi.getWishlist().then((r) => r.data.data),
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => usersApi.removeWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      toast.success('Removed from wishlist');
    },
    onError: () => toast.error('Failed to remove item'),
  });

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-cream-100 luxury-grain relative px-4">
        <div className="w-20 h-20 bg-brand-surface rounded-3xl flex items-center justify-center mb-8 text-brand-secondary border border-cream-200 shadow-sm animate-float">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-brand-primary mb-3">Your Wishlist</h2>
        <p className="text-gray-500 mb-10 text-center max-w-sm font-medium">Please log in to view and manage your curated favorites.</p>
        <button 
          onClick={() => navigate('/login?redirect=/wishlist')} 
          className="btn-primary px-10 py-4 rounded-pill uppercase tracking-[0.2em] text-xs"
        >
          Login to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 pt-32 pb-24 px-4 luxury-grain relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-brand-secondary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-gray-400 text-xs font-semibold uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link to="/" className="hover:text-brand-secondary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <Link to="/account" className="hover:text-brand-secondary transition-colors">Account</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-brand-primary">Wishlist</span>
        </div>

        {/* Luxury Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
              My <br />
              <span className="text-brand-secondary">Wishlist</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-0.5 w-12 bg-brand-secondary" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse aspect-[3/4] bg-cream-200 border-2 border-cream-100 rounded-3xl" />
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="card p-16 md:p-24 text-center relative overflow-hidden group max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-linear-to-b from-brand-surface/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-brand-surface rounded-3xl flex items-center justify-center mx-auto mb-8 text-brand-secondary border border-cream-200 shadow-sm">
                <Heart className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-brand-primary mb-3">Your Wishlist is Empty</h3>
              <p className="text-gray-500 text-sm mb-10 font-medium leading-relaxed">Save your favorite premium items here to buy them later or keep track of your most loved designs.</p>
              <Link to="/products" className="inline-flex items-center gap-2 px-10 py-4 rounded-pill bg-brand-primary text-white font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-brand-primary/20 transition-all">
                <ShoppingBag className="w-4 h-4" /> Start Exploring
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {wishlist.map(({ product }) => (
              <div key={product.id} className="relative group perspective-1000">
                <div className="transition-transform duration-500 group-hover:translate-y-[-8px]">
                  <ProductCard product={product} />
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeMutation.mutate(product.id);
                  }}
                  className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 scale-0 group-hover:scale-100 active:scale-90"
                  disabled={removeMutation.isPending}
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


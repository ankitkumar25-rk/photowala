import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '../api';
import { useAuthStore, useCartStore } from '../store';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => usersApi.getWishlist().then((r) => r.data.data),
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => usersApi.removeWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      toast.success('Removed from wishlist');
    },
    onError: () => toast.error('Failed to remove item'),
  });

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-cream-100 page-enter">
        <Heart className="w-16 h-16 text-cream-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Your Wishlist</h2>
        <p className="text-gray-500 mb-6">Please log in to view your wishlist.</p>
        <button onClick={() => navigate('/login?redirect=/wishlist')} className="btn-primary">
          Login to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 py-10 page-enter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-cream-200 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
            My Wishlist ({wishlist.length})
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse aspect-[3/4] bg-cream-200" />
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <Heart className="w-16 h-16 text-cream-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6 text-sm">Save your favorite items here to buy them later.</p>
            <button onClick={() => navigate('/products')} className="btn-primary px-8">
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map(({ product }) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeMutation.mutate(product.id);
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  disabled={removeMutation.isPending}
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

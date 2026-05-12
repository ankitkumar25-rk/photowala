import { useState, useEffect, createElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RotateCcw, Star, CheckCircle, ChevronRight } from 'lucide-react';
import {
  MdSecurity, MdLocalShipping, MdAssignmentReturn,
  Md3dRotation, MdCardGiftcard, MdWorkspacePremium,
  MdCreate, MdHome, MdStars
} from 'react-icons/md';
import { GiTrophyCup } from 'react-icons/gi';
import { brandAssets } from '../data/assets';
import { productsApi, categoriesApi } from '../api';
import ProductCard from '../components/ProductCard';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop', // Replace with your image
  'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1932&auto=format&fit=crop', // Replace with your image
  'https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=2080&auto=format&fit=crop', // Replace with your image
];

// ── Hero Section ─────────────────────────────────────────────
function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden text-white min-h-[500px] md:min-h-[600px] flex flex-col justify-center">
      {/* Slider Images */}
      {HERO_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <img src={src} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Gradient Overlay for Text Visibility */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/10" />
      <div className="absolute inset-0 bg-[#5a3f2f]/30" /> {/* Brand tint overlay */}
      <div className="absolute inset-0 opacity-[0.05] luxury-grain" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative z-10 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-black/30 backdrop-blur-md border border-white/20 text-[#fff2e6] text-sm font-semibold mb-6">
            <img src={brandAssets.favicon} className="w-4 h-4 animate-float" alt="" /> Handcrafted Photogifts For Every Occasion
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
            Turn Memories Into<br />
            <span className="text-[#d0a13f]">Gift-Worthy Stories</span>
          </h1>
          <p className="text-[#ffe7d6] text-lg md:text-xl leading-relaxed mb-8 max-w-lg drop-shadow-md">
            Discover premium trophies, mementos, and personalized photogifts designed to celebrate wins, milestones, and people you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-pill bg-cream-50 text-[#5e2916] font-bold hover:bg-[#fff1e7] transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ color: '#5e2916' }}
            >
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 rounded-pill bg-black/30 backdrop-blur-md border-2 border-white/45 text-white font-bold hover:bg-white/20 transition-all">
              Our Categories
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 mt-14">
          {[
            ['500+', 'Premium Products'],
            ['10K+', 'Happy Customers'],
            ['5★', 'Average Rating'],
            ['48h', 'Turnaround Time'],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold text-white drop-shadow-md">{num}</div>
              <div className="text-[#d0a13f] text-sm font-semibold drop-shadow-md">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------------------------------------------------------------------------
const CATEGORY_ICONS = {
  'trophies': <GiTrophyCup className="w-8 h-8 text-brand-primary" />,
  '3d-models': <Md3dRotation className="w-8 h-8 text-brand-primary" />,
  'corporate-gifts': <MdCardGiftcard className="w-8 h-8 text-brand-primary" />,
  'momentos': <MdWorkspacePremium className="w-8 h-8 text-brand-primary" />,
  'others': <MdStars className="w-8 h-8 text-brand-primary" />,
  'pen-holders': <MdCreate className="w-8 h-8 text-brand-primary" />,
  'temples': <MdHome className="w-8 h-8 text-brand-primary" />,
};

function CategoryGrid({ categories }) {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
            Shop by <br />
            <span className="text-brand-secondary">Category</span>
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-12 bg-brand-secondary" />
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Explore our curated range of premium products and keepsakes</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="group card p-6 flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-cream-200 hover:border-brand-secondary/30"
            >
              <div className="w-20 h-20 rounded-3xl bg-brand-surface flex items-center justify-center group-hover:bg-brand-primary group-hover:shadow-lg transition-all duration-300 border-2 border-cream-200 p-3 text-brand-primary group-hover:text-white shrink-0">
                {CATEGORY_ICONS[cat.slug] || (
                  <img src={brandAssets.favicon} className="w-8 h-8 object-contain" alt="" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-brand-primary text-sm leading-snug group-hover:text-brand-secondary transition-colors duration-300 uppercase tracking-wider">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mt-2 font-bold">{cat._count?.products || 0} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Trust Badges ──────────────────────────────────────────────
function TrustBadges() {
  const badges = [
    { icon: <MdStars className="w-7 h-7 text-brand-primary" />, label: 'Premium Quality Assured', desc: 'Sustainably crafted & highly rated' },
    { icon: <MdLocalShipping className="w-7 h-7 text-brand-primary" />, label: 'Free Delivery above ₹999', desc: 'Pan-India secure delivery in 2-5 days' },
    { icon: <MdAssignmentReturn className="w-7 h-7 text-brand-primary" />, label: 'Easy 7-Day Returns', desc: 'Hassle-free return policy' },
    { icon: <MdSecurity className="w-7 h-7 text-brand-primary" />, label: 'Exquisite Craftsmanship', desc: 'Precision finishes for every award' },
  ];

  return (
    <section className="bg-brand-surface py-16 border-y border-cream-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map(({ icon, label, desc }) => (
            <div key={label} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left p-4 rounded-2xl hover:bg-white/40 transition-colors border border-transparent hover:border-cream-200">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-cream-300 p-2.5 shadow-sm">
                {icon}
              </div>
              <div>
                <p className="font-bold text-brand-primary text-sm">{label}</p>
                <p className="text-gray-500 text-xs mt-0.5 font-medium">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.featured().then((r) => r.data.data),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30, // 30 minutes - categories change rarely
  });

  return (
    <div className="bg-cream-100 luxury-grain">
      <HeroSection />
      <TrustBadges />

      {categoriesData && <CategoryGrid categories={categoriesData} />}

      {/* Featured Products */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-100 h-100 bg-brand-secondary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
                Featured <br />
                <span className="text-brand-secondary">Products</span>
              </h2>
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-12 bg-brand-secondary" />
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Handpicked bestsellers loved by our customers</p>
              </div>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 rounded-pill bg-brand-primary text-white font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="bg-cream-200 aspect-square rounded-t-card" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-cream-300 rounded w-3/4" />
                    <div className="h-4 bg-cream-300 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featuredData?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-linear-to-r from-brand-primary via-brand-secondary to-orange-500 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 luxury-grain" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/20 backdrop-blur-md border border-white/30 text-brand-surface text-sm font-semibold mb-6">
            <Star className="w-4 h-4" /> Limited Time Offers
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Celebrate Every <br />
            Moment Better
          </h2>
          <p className="text-white/90 mb-10 text-lg max-w-xl mx-auto font-medium">
            Join thousands of customers choosing premium photogifts for birthdays, anniversaries, teams, and milestones.
          </p>
          <Link to="/products" className="inline-flex items-center gap-2 px-10 py-4 rounded-pill bg-white text-brand-primary font-bold hover:bg-cream-50 transition-all hover:shadow-lg hover:shadow-white/20">
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}


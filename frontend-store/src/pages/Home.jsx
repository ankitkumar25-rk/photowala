import { useState, useEffect, createElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RotateCcw, Star, CheckCircle } from 'lucide-react';
import { brandAssets } from '../data/assets';
import { productsApi, categoriesApi } from '../api';
import ProductCard from '../components/ProductCard';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop', // Replace with your image
  'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1932&auto=format&fit=crop', // Replace with your image
  'https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=2080&auto=format&fit=crop', // Replace with your image
];

// Ã¢â€â‚¬Ã¢â€â‚¬ Hero Section Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden text-white min-h-150 flex flex-col justify-center">
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
            Turn Memories Into<br />
            <span className="text-[#d0a13f]">Gift-Worthy Stories</span>
          </h1>
          <p className="text-[#ffe7d6] text-lg md:text-xl leading-relaxed mb-8 max-w-lg drop-shadow-md">
            Discover premium trophies, mementos, and personalized photogifts designed to celebrate wins, milestones, and people you love.
          </p>
          <div className="flex flex-wrap gap-4">
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
            ['5Ã¢Ëœâ€¦', 'Average Rating'],
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

// Ã¢â€â‚¬Ã¢â€â‚¬ Category Grid Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const CATEGORY_EMOJIS = {
  'trophies': 'Ã°Å¸Ââ€ ',
  '3d-models': 'Ã°Å¸Â§Å ',
  'corporate-gifts': 'Ã°Å¸â€œâ€º',
  'momentos': 'Ã°Å¸â€™Å½',
  'others': 'Ã°Å¸Å½Â',
  'pen-holders': 'Ã°Å¸â€“â€¹Ã¯Â¸Â',
  'temples': 'Ã¢â€ºÂ©Ã¯Â¸Â',
};

function CategoryGrid({ categories }) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#5b3f2f]">
            Shop by Category
          </h2>
          <p className="text-[#a68971] mt-2">Explore our curated range of premium products and keepsakes</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="group card p-5 flex flex-col items-center text-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#f5e7d8] flex items-center justify-center text-3xl group-hover:bg-[#efe0cf] transition-colors border border-[#d8a45f]/40">
                {CATEGORY_EMOJIS[cat.slug] || 'Ã°Å¸Ââ€ '}
              </div>
              <div>
                <h3 className="font-semibold text-[#5b3f2f] text-sm leading-snug group-hover:text-[#b88a2f] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#a68971] mt-0.5">{cat._count?.products || 0} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Trust Badges Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function TrustBadges() {
  const badges = [
    { icon: Shield, label: 'Premium Quality Assured', desc: 'Sustainably crafted & highly rated' },
    { icon: Truck, label: 'Free Delivery above ₹999', desc: 'Pan-India secure delivery in 2-5 days' },
    { icon: RotateCcw, label: 'Easy 7-Day Returns', desc: 'Hassle-free return policy' },
    { icon: CheckCircle, label: 'Exquisite Craftsmanship', desc: 'Precision finishes for every award' },
  ];

  return (
    <section className="bg-[#f5e7d8] py-12 border-y border-[#d8a45f]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map(({ icon, label, desc }) => (
            <div key={label} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-cream-300">
                {createElement(icon, { className: 'w-6 h-6 text-[#b88a2f]' })}
              </div>
              <div>
                <p className="font-semibold text-[#5b3f2f] text-sm">{label}</p>
                <p className="text-[#a68971] text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Main Page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export default function Home() {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.featured().then((r) => r.data.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data.data),
  });

  return (
    <div>
      <HeroSection />
      <TrustBadges />

      {categoriesData && <CategoryGrid categories={categoriesData} />}

      {/* Featured Products */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-brand-primary">
                Featured Products
              </h2>
              <p className="text-[#876b5f] mt-1">Handpicked bestsellers loved by our customers</p>
            </div>
            <Link to="/products" className="btn-secondary text-sm py-2 px-5">
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
      <section className="bg-linear-to-r from-[#7a3218] via-[#a6431a] to-[#c85212] py-16 border-t border-[#f6b889]/45">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#fff6f0] mb-4">
            Celebrate Every Moment Better Ã°Å¸Å½Â
          </h2>
          <p className="text-[#ffe7d6] mb-8 text-lg max-w-xl mx-auto">
            Join thousands of customers choosing premium photogifts for birthdays, anniversaries, teams, and milestones.
          </p>
          <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 rounded-pill bg-cream-50 text-[#5e2916] font-bold hover:bg-[#fff2e9] hover:text-[#4a2012] transition-all hover:shadow-lg">
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}


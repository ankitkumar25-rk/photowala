import React from 'react';
import { Shield, Target, Award, Heart, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-cream-100 py-16 page-enter">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
            About <span className="text-brand-secondary">Photowalagift</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Honoring excellence and celebrating life through premium recognition solutions.
          </p>
        </div>

        {/* Our Mission */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-cream-200 text-center">
          <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-brand-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Fraunces, serif' }}>Our Mission</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            At <strong>Photowalagift</strong>, we believe that every achievement, whether corporate or personal, deserves to be immortalized. We specialize in crafting high-quality awards, trophies, and personalized home decor that transform significant milestones into lasting legacies. Our mission is to provide premium recognition solutions that combine modern aesthetics with timeless craftsmanship.
          </p>
        </section>

        {/* What We Do */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-brand-primary text-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Fraunces, serif' }}>What We Do</h2>
            <p className="text-cream-50/80 mb-6">
              We are a premier e-commerce destination for high-grade mementos and customized gifting. Our product range is meticulously curated to serve two distinct worlds:
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-brand-secondary flex-shrink-0" />
                <div>
                  <strong className="block text-white">Corporate & Academic Recognition</strong>
                  <span className="text-cream-50/80 text-sm">From diamond-cut crystal trophies and 3D laser-etched blocks to traditional wooden shields and professional office nameplates.</span>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-brand-secondary flex-shrink-0" />
                <div>
                  <strong className="block text-white">Bespoke Home & Personal Gifting</strong>
                  <span className="text-cream-50/80 text-sm">Hand-finished wooden photo frames, elegant glass accents, and custom-engraved items that turn memories into mantelpiece treasures.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-brand-secondary text-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Our Categories</h2>
            <ul className="space-y-6">
              <li className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <strong className="block text-lg mb-1">Awards & Trophies</strong>
                <span className="text-white/80 text-sm">Crystal Pillars, Star Performers, Glass Shields, and Victory Flames.</span>
              </li>
              <li className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <strong className="block text-lg mb-1">Office Supplies</strong>
                <span className="text-white/80 text-sm">Premium Acrylic Name Plates and Professional Desktop Organizers.</span>
              </li>
              <li className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <strong className="block text-lg mb-1">Home Decor</strong>
                <span className="text-white/80 text-sm">Personalized Frames, Keepsake Boxes, and Commemorative Plaques.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center" style={{ fontFamily: 'Fraunces, serif' }}>
            Why Choose Photowalagift?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: 'Unrivaled Material Quality', desc: 'We use only the finest optical crystal, seasoned MDF wood, and polished metals. Our products are designed to have a substantial weight and a brilliant finish that commands attention.' },
              { icon: Award, title: 'Precision Customization', desc: 'Using state-of-the-art laser engraving and high-definition printing technology, we ensure that your logos, names, and messages are rendered with absolute clarity and permanence.' },
              { icon: Target, title: 'Design-Led Approach', desc: 'Our catalog features a blend of contemporary "Peak" and "Diamond" crystal designs alongside "Heritage" wooden pieces, ensuring we have the right aesthetic for any ceremony or home style.' },
              { icon: Heart, title: 'Service Excellence', desc: 'We understand the importance of timing in recognition events. We offer specialized quick-turnaround production and secure, break-safe packaging to ensure your awards arrive in gallery-ready condition.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-3xl border border-cream-200 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-cream-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand-secondary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Promise */}
        <section className="bg-cream-200 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            The Photowalagift Promise
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto italic">
            "Whether you are a HR professional honoring a decade of service, a school principal celebrating a graduate, or an individual capturing a family memory, we provide the physical symbol of that pride. At <strong>Photowalagift</strong>, we don't just sell products; we help you honor excellence and celebrate life."
          </p>
        </section>

      </div>
    </div>
  );
}

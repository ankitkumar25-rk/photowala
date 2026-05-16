import { Phone, MessageCircle, Mail, MapPin, Package, Percent, Clock, CheckCircle2, Truck } from 'lucide-react';
import { brandAssets } from '../data/assets';

export default function BulkOrders() {
  const whatsappNumber = "+919782570014"; // Replace with actual number
  const phoneNumber = "+919782570014";    // Replace with actual number
  const email = "photowalagiftphotowalagift@gmail.com";

  return (
    <div className="min-h-screen bg-cream-100 page-enter">
      {/* Hero Section */}
      <div className="relative bg-brand-primary text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">Bulk Orders & Corporate Deals</h1>
          <p className="text-lg md:text-xl text-brand-soft/80 max-w-2xl mx-auto leading-relaxed">
            Planning a big event or looking for corporate gifting solutions? Get exclusive discounts and personalized service for your bulk requirements.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Contact Options */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-8 bg-white shadow-xl border-brand-primary/10">
              <h2 className="text-2xl font-bold text-brand-primary mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <a 
                  href={`tel:${phoneNumber}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-all shadow-lg group"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">Call Us Now</p>
                    <p className="text-lg font-bold">{phoneNumber}</p>
                  </div>
                </a>

                <a 
                  href={`https://wa.me/${whatsappNumber.replace('+', '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#25D366] text-white hover:opacity-90 transition-all shadow-lg group"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">WhatsApp Message</p>
                    <p className="text-lg font-bold">Chat with Expert</p>
                  </div>
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-brand-soft space-y-4">
                <div className="flex items-center gap-4 text-brand-primary">
                  <Mail className="w-5 h-5 text-brand-secondary" />
                  <span className="text-sm font-semibold">{email}</span>
                </div>
                <div className="flex items-start gap-4 text-brand-primary">
                  <MapPin className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Dadji Ki Factory, Jhunjhunu, Rajasthan</span>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-brand-surface border-brand-secondary/20">
               <div className="flex items-center gap-3 mb-4">
                 <Clock className="w-5 h-5 text-brand-secondary" />
                 <h3 className="font-bold text-brand-primary">Response Time</h3>
               </div>
               <p className="text-sm text-brand-primary/70 leading-relaxed">
                 Our bulk order experts typically respond within **2-4 business hours** for all inquiries.
               </p>
            </div>
          </div>

          {/* Right: Benefits & Why Choose Us */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
               {[
                 { icon: <Percent />, title: "Tiered Discounts", desc: "Save more as you order more. Custom pricing for quantities above 50 units." },
                 { icon: <Package />, title: "Custom Branding", desc: "Complete personalization options including logo engraving and custom packaging." },
                 { icon: <CheckCircle2 />, title: "Quality Check", desc: "Rigorous quality control for every single piece in your bulk shipment." },
                 { icon: <Truck className="w-6 h-6" />, title: "Insured Shipping", desc: "Safe and insured doorstep delivery across India with real-time tracking." },
               ].map((item, i) => (
                 <div key={i} className="card p-6 hover:border-brand-secondary/30 transition-colors">
                   <div className="w-12 h-12 bg-brand-surface text-brand-secondary rounded-xl flex items-center justify-center mb-4">
                     {item.icon}
                   </div>
                   <h3 className="text-lg font-bold text-brand-primary mb-2">{item.title}</h3>
                   <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>

            <div className="card p-10 bg-white border-brand-primary/5">
              <h2 className="text-2xl font-bold text-brand-primary mb-8 text-center">Perfect For</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Corporate Events', 'Weddings', 'School Awards', 'Brand Launches'].map((item) => (
                  <div key={item} className="text-center group">
                    <div className="w-16 h-16 mx-auto bg-cream-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-brand-surface transition-colors border border-brand-primary/5">
                      <div className="w-8 h-8 text-brand-secondary">🎁</div>
                    </div>
                    <p className="text-sm font-bold text-brand-primary">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-secondary/10 rounded-3xl p-8 border border-brand-secondary/20">
              <h3 className="text-xl font-bold text-brand-primary mb-4">Have a specific requirement?</h3>
              <p className="text-gray-700 mb-6">
                Tell us about your event, the product you're interested in, and the quantity you need. We'll get back to you with the best possible quote.
              </p>
              <button 
                onClick={() => window.location.href = `mailto:${email}`}
                className="btn-primary"
              >
                Request a Quote via Email
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

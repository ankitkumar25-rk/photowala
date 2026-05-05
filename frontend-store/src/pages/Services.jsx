import { useState } from 'react';
import { Calculator, ChevronRight, ChevronLeft, Check, Zap, Drill, Award, CircleDollarSign, Timer, Lightbulb, Settings, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceRequestsApi } from '../api';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';

const SERVICES = [
  {
    type: 'CO2_LASER',
    title: 'CO2 Laser Machine',
    desc: 'Best for acrylic, wood, and signage work with clean edges and fast turnaround.',
    icon: Zap,
    features: ['Precision Cutting', 'Fast Turnaround', 'Clean Edges'],
  },
  {
    type: 'LASER_MARKING',
    title: 'Laser Marking Machine',
    desc: 'Ideal for precise branding on metal, plastic, and coated surfaces.',
    icon: Zap,
    features: ['Metal Engraving', 'QR Codes', 'Permanent Marks'],
  },
  {
    type: 'CNC_ROUTER',
    title: 'CNC Router Machine',
    desc: 'Reliable for heavy-duty cutting, engraving, and production runs.',
    icon: Drill,
    features: ['Woodworking', '3D Carving', 'Heavy Duty'],
  }
];

const DEFAULT_FORM = {
  sizeL: '',
  sizeB: '',
  sizeH: '',
  quantity: '',
  priceRange: '',
  timingRange: '',
  designFile: null,
  notes: '',
};

function ServiceFormView({ service, onBack }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const Icon = service.icon;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      toast.success(`File "${file.name}" selected successfully!`);
    }
    setForm((prev) => ({ ...prev, designFile: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.designFile) {
      toast.error('Please upload a .cdr, .zip, or .pdf design file.');
      return;
    }

    setSubmitting(true);
    try {
      await serviceRequestsApi.create({
        serviceType: service.type,
        sizeL: form.sizeL,
        sizeB: form.sizeB,
        sizeH: form.sizeH,
        quantity: form.quantity,
        priceRange: form.priceRange,
        timingRange: form.timingRange,
        notes: form.notes,
        designFile: form.designFile,
      });
      toast.success('Request submitted. Our team will contact you soon.');
      setForm(DEFAULT_FORM);
      onBack();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 -mt-20 pb-20 relative z-10">
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-white/90 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Services
      </button>

      <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-center gap-5 mb-10 pb-8 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF4E5] flex items-center justify-center shrink-0">
            <Icon className="w-8 h-8 text-[#8F431A]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>{service.title}</h2>
            <p className="text-base text-gray-500 mt-2">{service.desc}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size L</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.sizeL}
                onChange={handleChange('sizeL')}
                className="input-field"
                placeholder="Length"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size B</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.sizeB}
                onChange={handleChange('sizeB')}
                className="input-field"
                placeholder="Breadth"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size H</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.sizeH}
                onChange={handleChange('sizeH')}
                className="input-field"
                placeholder="Height"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={handleChange('quantity')}
                className="input-field"
                placeholder="Total qty"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Design File (.cdr, .zip, .pdf)</label>
              <input
                type="file"
                accept=".cdr,.zip,.pdf"
                onChange={handleFile}
                className="input-field py-2"
                required
              />
              {form.designFile && (
                <p className="mt-1.5 text-xs text-[#8F431A] font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Selected: {form.designFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
              <input
                type="text"
                value={form.priceRange}
                onChange={handleChange('priceRange')}
                className="input-field"
                placeholder="e.g. 10,000 - 20,000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Timing Range</label>
              <input
                type="text"
                value={form.timingRange}
                onChange={handleChange('timingRange')}
                className="input-field"
                placeholder="e.g. 7-10 days"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
            <textarea
              rows="3"
              value={form.notes}
              onChange={handleChange('notes')}
              className="input-field"
              placeholder="Add any specific requirements"
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full py-4 bg-[#8F431A] text-white rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#7A3614] transition-colors" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleServiceClick = (service) => {
    if (!user) {
      toast.error('Please login to use this service');
      navigate('/login?redirect=/services');
      return;
    }
    setSelectedService(service);
  };

  return (
    <div className="min-h-screen bg-[#F6F4F1] page-enter font-sans flex flex-col">
      {/* Header Section */}
      <div className="bg-[#8F431A] text-white pt-20 pb-36 shrink-0">
        <div className="max-w-5xl mx-auto px-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/30 text-white/90">
              Tools & Utilities
            </span>
            <h1 className="text-5xl font-bold mt-6 mb-4 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
              {selectedService ? selectedService.title : 'Services'}
            </h1>
            <p className="text-white/85 text-lg leading-relaxed max-w-xl">
              {selectedService ? 'Fill out the form below to initiate your customized request.' : 'Practical tools designed to help you calculate, plan, and execute print jobs with confidence.'}
            </p>
          </div>
        </div>
      </div>

      {selectedService ? (
        <div className="flex-1">
          <ServiceFormView service={selectedService} onBack={() => setSelectedService(null)} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="max-w-5xl mx-auto px-4 -mt-24 pb-20 relative z-10 w-full shrink-0">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Paper GSM Calculator Card */}
              <a
                href="/services/paper-gsm"
                className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow block relative"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-[16px] bg-[#FFF4E5] flex items-center justify-center text-[#8F431A]">
                    <Calculator className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCF0C8] text-[#8F431A]">
                    Free Tool
                  </span>
                </div>
                
                <h2 className="text-[26px] font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
                  Paper GSM Calculator
                </h2>
                
                <p className="text-[#6B7280] text-[15px] mb-8 leading-relaxed pr-4">
                  Calculate GSM quickly from sheet size, sheet count, and total weight. Ideal for estimating.
                </p>
                
                <div className="flex flex-wrap gap-2.5 mb-10">
                  <span className="px-3.5 py-1.5 flex items-center gap-1.5 bg-[#F4EBE1] text-[#8F431A] text-[10px] font-bold uppercase tracking-wider rounded-full">
                    <Check className="w-3.5 h-3.5 opacity-80" strokeWidth={2.5} /> Quick Result
                  </span>
                  <span className="px-3.5 py-1.5 flex items-center gap-1.5 bg-[#F4EBE1] text-[#8F431A] text-[10px] font-bold uppercase tracking-wider rounded-full">
                    <Check className="w-3.5 h-3.5 opacity-80" strokeWidth={2.5} /> Accurate
                  </span>
                </div>
                
                <div className="mt-auto">
                  <div className="w-full py-4 border border-[#4A2511] text-[#4A2511] rounded-[10px] text-xs font-bold uppercase tracking-[0.1em] text-center hover:bg-[#4A2511] hover:text-white transition-colors pointer-events-none">
                    Open Calculator
                  </div>
                </div>
              </a>

              {/* Other Services Cards */}
              {SERVICES.map((service) => (
                <div
                  key={service.type}
                  onClick={() => handleServiceClick(service)}
                  className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow flex flex-col group cursor-pointer relative"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-[16px] bg-[#FFF4E5] flex items-center justify-center text-[#8F431A] group-hover:scale-105 transition-transform duration-300">
                      <service.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 group-hover:text-[#8F431A] transition-all" />
                  </div>
                  
                  <h2 className="text-[26px] font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
                    {service.title}
                  </h2>
                  
                  <p className="text-[#6B7280] text-[15px] mb-8 leading-relaxed pr-4">
                    {service.desc}
                  </p>
                  
                  <div className="flex flex-wrap gap-2.5 mb-10">
                    {service.features.map((feature) => (
                      <span key={feature} className="px-3.5 py-1.5 flex items-center gap-1.5 bg-[#F4EBE1] text-[#8F431A] text-[10px] font-bold uppercase tracking-wider rounded-full">
                        <Check className="w-3.5 h-3.5 opacity-80" strokeWidth={2.5} /> {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-auto">
                    <button className="w-full py-4 border border-[#4A2511] text-[#4A2511] rounded-[10px] text-xs font-bold uppercase tracking-[0.1em] text-center hover:bg-[#4A2511] hover:text-white transition-colors pointer-events-none">
                      View & Submit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* We Are Dedicated To Section */}
          <div className="py-24 mt-auto border-t border-gray-100" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 35%, #f3e8df 65%, #e8d0bb 100%)' }}>
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6" style={{ fontFamily: 'Fraunces, serif' }}>We Are Dedicated To</h2>
                <div className="w-16 h-1 bg-[#8F431A] mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Premium Quality */}
                <div className="bg-[#5a3f2f] text-white rounded-[24px] p-10 text-center shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgb(90,63,47,0.3)] transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <div className="bg-white/10 w-24 h-24 mx-auto rounded-[20px] flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <Award className="w-12 h-12 text-[#E6C47A]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-3">Premium Quality</h3>
                  <p className="text-white/70 italic text-[15px] font-serif">World class</p>
                </div>
                
                {/* Lowest Price */}
                <div className="bg-[#d96a22] text-white rounded-[24px] p-10 text-center shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgb(217,106,34,0.3)] transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <div className="bg-white/15 w-24 h-24 mx-auto rounded-[20px] flex items-center justify-center mb-8 border border-white/20 group-hover:scale-110 transition-transform duration-500">
                    <CircleDollarSign className="w-12 h-12 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-3">Lowest Price</h3>
                  <p className="text-white/80 italic text-[15px] font-serif">Guaranteed</p>
                </div>
                
                {/* Express Services */}
                <div className="bg-[#d8a45f] text-white rounded-[24px] p-10 text-center shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgb(216,164,95,0.3)] transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <div className="bg-black/5 w-24 h-24 mx-auto rounded-[20px] flex items-center justify-center mb-8 border border-black/5 group-hover:scale-110 transition-transform duration-500">
                    <Timer className="w-12 h-12 text-[#5a3f2f]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-3">Express Services</h3>
                  <p className="text-white/80 italic text-[15px] font-serif text-[#5a3f2f]">Always ontime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vision / Policies / Mission */}
          <div className="py-24 bg-[#F6F4F1]">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow relative overflow-hidden group border border-[#8F431A]/5">
                  <Lightbulb className="absolute -bottom-8 -right-8 w-40 h-40 text-[#8F431A] opacity-5 group-hover:scale-110 transition-transform duration-700" />
                  <div className="w-14 h-14 rounded-[16px] bg-[#FFF4E5] flex items-center justify-center text-[#8F431A] mb-8">
                    <Lightbulb className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[26px] font-bold text-[#1A1A1A] mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Our Vision</h3>
                  <div className="space-y-4 text-[#6B7280] text-[15px] leading-relaxed relative z-10 pr-2">
                    <p>Our vision is to bring all printers Pan India to one platform and unite them to enhance the strength as union.</p>
                    <p>In addition to this we also look forword to extend our services to Printers for their welfare and development.</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow relative overflow-hidden group border border-[#8F431A]/5">
                  <Settings className="absolute -bottom-8 -right-8 w-40 h-40 text-[#8F431A] opacity-5 group-hover:rotate-45 transition-transform duration-1000" />
                  <div className="w-14 h-14 rounded-[16px] bg-[#FFF4E5] flex items-center justify-center text-[#8F431A] mb-8">
                    <Settings className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[26px] font-bold text-[#1A1A1A] mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Our Policies</h3>
                  <div className="space-y-4 text-[#6B7280] text-[15px] leading-relaxed relative z-10 pr-2">
                    <p>To work as B2B and provide our Best in class services only to Printers & Advertising agencies at least margin and in fixed predefined timeframe.</p>
                    <p>We never compromise with quality and quantity of the product. In other words our customers (Printer & Advertisers) get best Value for money.</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow relative overflow-hidden group border border-[#8F431A]/5">
                  <Target className="absolute -bottom-8 -right-8 w-40 h-40 text-[#8F431A] opacity-5 group-hover:scale-110 transition-transform duration-700" />
                  <div className="w-14 h-14 rounded-[16px] bg-[#FFF4E5] flex items-center justify-center text-[#8F431A] mb-8">
                    <Target className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[26px] font-bold text-[#1A1A1A] mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Our Mission</h3>
                  <div className="space-y-4 text-[#6B7280] text-[15px] leading-relaxed relative z-10 pr-2">
                    <p>To make India self dependent and leader in printer technology.</p>
                    <p>To create innovative printing services & products to be available for Indian as well as International customers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

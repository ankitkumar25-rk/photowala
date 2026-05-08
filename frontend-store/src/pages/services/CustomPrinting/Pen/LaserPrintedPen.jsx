import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PenTool, StickyNote, Printer, FileText, Tag, Book, Mail, 
  HelpCircle, UploadCloud, AlertTriangle, ShieldCheck, Leaf, ShoppingCart
} from 'lucide-react';
import { serviceAssets } from '../../../../data/assets';

const SIDEBAR_LINKS = [
  { id: 'pen', icon: PenTool, label: 'Pen', active: true, to: '/services/custom-printing/pen' },
  { id: 'sticker', icon: StickyNote, label: 'Sticker Labels', to: '/services/custom-printing/sticker-labels' },
  { id: 'digital', icon: Printer, label: 'Digital Paper Printing', to: '#' },
  { id: 'letterhead', icon: FileText, label: 'Letterhead', to: '/services/custom-printing/letterhead' },
  { id: 'garment', icon: Tag, label: 'Garment Tag', to: '/services/custom-printing/garment-tag' },
  { id: 'billbook', icon: Book, label: 'Bill Book', to: '#' },
  { id: 'envelop', icon: Mail, label: 'Envelop', to: '/services/custom-printing/envelop' },
];

export default function LaserPrintedPen() {
  const [deliveryOption, setDeliveryOption] = useState('courier');
  const [designOption, setDesignOption] = useState('online');

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#f2eee9] border-r border-[#e8dfd5] flex flex-col p-6 shrink-0">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Printing</h2>
          <p className="text-xs text-gray-500">Explore categories</p>
        </div>

        <nav className="flex-1 space-y-2 mb-8">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link 
                key={link.id} 
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  link.active 
                    ? 'bg-[#b65e2e] shadow-md text-white' 
                    : 'text-gray-600 hover:bg-[#e8dfd5] hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12">
        {/* Breadcrumb */}
        <div className="text-sm font-medium mb-8 flex items-center gap-2">
          <Link to="/" className="text-[#3b71ca] hover:text-[#285192] transition-colors">Home</Link>
          <span className="text-gray-500">›</span>
          <Link to="/services" className="text-[#3b71ca] hover:text-[#285192] transition-colors">Our Services</Link>
          <span className="text-gray-500">›</span>
          <Link to="/services/custom-printing" className="text-[#3b71ca] hover:text-[#285192] transition-colors">Custom Printing</Link>
          <span className="text-gray-500">›</span>
          <span className="text-[#a64d24]">Pen</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Laser Printed Pens</h1>
          <p className="text-gray-600 max-w-3xl leading-relaxed">
            Precision-etched branding for executive gifts and corporate identity. High-quality metal and matte finishes available for bulk order.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column (Form) */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#e8dfd5] p-6 lg:p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Order Name</label>
                  <input type="text" placeholder="e.g. Quarterly Executive Pens" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e] transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Product</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e] transition-shadow bg-white">
                    <option>Laser Printed Pens</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pen Type</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e] transition-shadow bg-white">
                    <option>Select model (101-110)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e] transition-shadow bg-white">
                    <option>Select quantity (1-100)</option>
                  </select>
                </div>
              </div>

              {/* Delivery Option */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Delivery Option</label>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDeliveryOption('courier')}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deliveryOption === 'courier' ? 'border-[#b65e2e]' : 'border-gray-300'}`}>
                    {deliveryOption === 'courier' && <div className="w-2 h-2 rounded-full bg-[#b65e2e]"></div>}
                  </div>
                  <span className="text-sm font-medium text-gray-800">Deliver By Courier</span>
                </div>
              </div>

              {/* Design File */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Design File</label>
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDesignOption('online')}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${designOption === 'online' ? 'border-[#b65e2e]' : 'border-gray-300'}`}>
                      {designOption === 'online' && <div className="w-2 h-2 rounded-full bg-[#b65e2e]"></div>}
                    </div>
                    <span className="text-sm font-medium text-gray-800">Attach File Online</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDesignOption('email')}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${designOption === 'email' ? 'border-[#b65e2e]' : 'border-gray-300'}`}>
                      {designOption === 'email' && <div className="w-2 h-2 rounded-full bg-[#b65e2e]"></div>}
                    </div>
                    <span className="text-sm font-medium text-gray-800">Send via Email</span>
                  </div>
                </div>

                {/* Upload Box */}
                <div className="border-2 border-dashed border-[#d1a88b] bg-[#fffaf5] rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-[#fbf4ea]">
                  <UploadCloud className="w-10 h-10 text-[#a64d24] mb-3" />
                  <p className="text-sm font-bold text-gray-800 mb-1">Drag and drop your logo here</p>
                  <p className="text-xs text-gray-500 mb-6">SVG, PDF, or High-Res PNG (Max 10MB)</p>
                  <button className="border border-[#b65e2e] text-[#b65e2e] hover:bg-[#b65e2e] hover:text-white transition-colors font-semibold py-2 px-6 rounded-lg text-sm bg-white">
                    Choose File
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-[#fff4f2] border border-[#f5c6cb] rounded-lg p-4 flex gap-3 mb-6 items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-700">Email Submission Warning</h4>
                  <p className="text-xs text-red-600 mt-0.5">Orders sent via email may experience a 24-hour delay in processing for manual verification.</p>
                </div>
              </div>

              {/* Remark */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Special Remark</label>
                  <span className="text-xs text-gray-400">0 / 250</span>
                </div>
                <textarea 
                  rows="3" 
                  placeholder="Any specific placement instructions?" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e] transition-shadow resize-none"
                ></textarea>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f0ece5] rounded-xl p-5 border border-[#e3dacd]">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#8c3a1b]" />
                  <h4 className="font-bold text-gray-900 text-sm">Precision Etching</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Our high-grade laser etching ensures your brand logo never fades, even with heavy daily usage on metal surfaces.
                </p>
              </div>
              <div className="bg-[#f0ece5] rounded-xl p-5 border border-[#e3dacd]">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-green-700" />
                  <h4 className="font-bold text-gray-900 text-sm">Premium Materials</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We use sustainably sourced wood and recycled alloys for our eco-range of laser-etched professional instruments.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Summary) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-[#1c1a19] text-white rounded-2xl overflow-hidden shadow-lg border border-gray-800">
              <div className="relative h-48 w-full">
                <img src={serviceAssets.penPreview} alt="Pen Preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-4 right-4 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                  Bulk Savings Active
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1a19] to-transparent"></div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-lg mb-6 border-b border-gray-700 pb-3">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Base Cost (50 Units)</span>
                    <span className="font-medium">$249.50</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-400">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Bulk Discount (15%)</span>
                    <span className="font-bold">-$37.42</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">GST (18%)</span>
                    <span className="font-medium">$38.17</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8 border-t border-gray-700 pt-4">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-2xl text-white">$250.25</span>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-[#b65e2e] hover:bg-[#a15024] text-white font-bold py-3.5 rounded-xl transition-colors mb-4">
                  <ShoppingCart className="w-5 h-5" /> Add Order
                </button>
                <p className="text-center text-xs text-gray-500 italic">Estimated delivery: 5-7 business days</p>
              </div>
            </div>

            {/* Other Pen Styles */}
            <div className="bg-[#fcfaf8] rounded-2xl border border-[#e8dfd5] p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 text-sm mb-4">Other Pen Styles</h3>
              <div className="space-y-3">
                <div className="border border-[#b65e2e] bg-[#fffaf5] rounded-xl p-3 flex gap-3 cursor-pointer items-center">
                  <div className="bg-[#f0ece5] p-2 rounded-lg text-[#b65e2e]">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#a64d24]">Laser Printed Pen</h4>
                    <p className="text-[10px] text-gray-500">Active & Popular</p>
                  </div>
                </div>
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-3 flex gap-3 items-center opacity-70">
                  <div className="bg-gray-200 p-2 rounded-lg text-gray-500">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-700">Second Pen Style</h4>
                    <p className="text-[10px] text-gray-500 italic">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

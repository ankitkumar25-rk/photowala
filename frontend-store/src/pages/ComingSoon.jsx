import { Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

export default function ComingSoon({ service }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-[#fffaf5] rounded-3xl flex items-center justify-center mb-8 border-2 border-[#f3ebdf] animate-bounce">
        <Construction className="w-12 h-12 text-[#b65e2e]" />
      </div>
      <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tighter">
        {service || 'Service'} <span className="text-[#b65e2e]">Coming Soon</span>
      </h1>
      <p className="text-gray-500 max-w-md mb-10 leading-relaxed font-medium">
        We are currently refining the customization options for this service to ensure you get the best quality. 
        It will be available for ordering very soon!
      </p>
      <Link 
        to="/services/custom-printing/pen" 
        className="flex items-center gap-2 bg-[#b65e2e] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#a15024] transition-all shadow-lg hover:shadow-[#b65e2e]/20"
      >
        <ArrowLeft className="w-5 h-5" />
        Explore Laser Pens
      </Link>
    </div>
  );
}

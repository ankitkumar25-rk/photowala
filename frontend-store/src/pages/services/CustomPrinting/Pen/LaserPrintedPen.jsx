import { useState } from 'react';
import { ChevronLeft, Award, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LaserPrintedPen() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(100);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center gap-6 pb-8 border-b border-gray-200">
            <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Award className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
                Laser Printed Pen
              </h1>
              <p className="text-gray-600 mt-2">Production Time: 5 days</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              Personalize any pen with precision laser engraving – your name, logo, or message etched permanently.
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Precision Laser Engraving</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">GST Invoice Provided</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Free Courier Delivery</span>
            </div>
          </div>

          {/* Ordering */}
          <div className="mt-10 border-t border-gray-200 pt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Place Your Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message/Design</label>
                <textarea
                  placeholder="Enter text or upload design details..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows="4"
                />
              </div>

              <button
                onClick={() => toast.success('Request submitted! Our team will contact you soon.')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Submit Request
              </button>
              <p className="text-xs text-gray-500 text-center">
                Our team will contact you with a quote and timeline
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

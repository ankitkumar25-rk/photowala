export default function Services() {
  return (
    <div className="min-h-screen bg-cream-100 px-4 py-20 flex items-center justify-center">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <div className="inline-block px-6 py-2 bg-orange-100 rounded-full mb-6">
            <span className="text-sm font-bold text-orange-700 uppercase tracking-wider">Coming Soon</span>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Services</h1>
        
        <p className="text-xl text-gray-600 mb-8">
          We're working on bringing you premium laser cutting, engraving, and custom printing services. Stay tuned!
        </p>

        <div className="inline-block px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all">
          <a href="/">← Back to Home</a>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-4xl mb-3">🔥</div>
            <h3 className="font-bold text-gray-900 mb-2">Laser Cutting</h3>
            <p className="text-sm text-gray-600">Precision cutting for wood, acrylic, and more</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="font-bold text-gray-900 mb-2">Laser Marking</h3>
            <p className="text-sm text-gray-600">Permanent engraving on metal and other surfaces</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="font-bold text-gray-900 mb-2">CNC Routing</h3>
            <p className="text-sm text-gray-600">Heavy-duty cutting and 3D carving</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-brand-primary">
            <div className="text-4xl mb-3">🖨️</div>
            <h3 className="font-bold text-gray-900 mb-2">Custom Printing</h3>
            <p className="text-sm text-gray-600">High-quality printed pens and promotional materials</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';

export default function ZoomableImage({ src, alt, className = "" }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleToggleZoom = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      setScale(2);
    }
  };

  const handleWheel = (e) => {
    if (!isZoomed) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.min(Math.max(1, scale + delta), 5);
    setScale(newScale);
    if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e) => {
    if (!isZoomed || scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isZoomed || scale <= 1) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Constraints (optional, but good for UX)
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isZoomed, scale]);

  return (
    <>
      <div 
        className={`relative overflow-hidden cursor-zoom-in ${className}`}
        onClick={handleToggleZoom}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-300"
        />
        <div className="absolute bottom-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {isZoomed && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-10 transition-all animate-in fade-in duration-300">
          <div 
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={src}
              alt={alt}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                maxHeight: '90vh',
                maxWidth: '90vw'
              }}
              className="object-contain select-none shadow-2xl rounded-lg"
              draggable="false"
            />
          </div>

          {/* Controls */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <button 
                    onClick={() => setScale(s => Math.max(1, s - 0.5))}
                    className="p-1 text-white hover:text-brand-secondary transition-colors"
                >
                    <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-xs font-bold w-8 text-center">{Math.round(scale * 100)}%</span>
                <button 
                    onClick={() => setScale(s => Math.min(5, s + 0.5))}
                    className="p-1 text-white hover:text-brand-secondary transition-colors"
                >
                    <ZoomIn className="w-5 h-5" />
                </button>
            </div>
            <button
              onClick={handleToggleZoom}
              className="p-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full transition-colors border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-[10px] font-medium uppercase tracking-[0.2em] pointer-events-none">
            Scroll to zoom • Drag to pan
          </div>
        </div>
      )}
    </>
  );
}

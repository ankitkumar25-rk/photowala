import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      document.body.style.overflow = 'unset';
    } else {
      setIsZoomed(true);
      setScale(2);
      document.body.style.overflow = 'hidden';
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

  // Clean up overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const overlay = isZoomed ? (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 sm:p-10 transition-all animate-in fade-in duration-300">
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          if (!isZoomed || scale <= 1) return;
          setIsDragging(true);
          const touch = e.touches[0];
          setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
        }}
        onTouchMove={(e) => {
          if (!isDragging || !isZoomed || scale <= 1) return;
          const touch = e.touches[0];
          setPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
        }}
        onTouchEnd={handleMouseUp}
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

      {/* Controls - Positioned even higher and ensuring visibility */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-3 z-[10000]">
        <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
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
          className="p-3 bg-white/20 backdrop-blur-xl hover:bg-white/30 text-white rounded-full transition-all border border-white/30 shadow-xl active:scale-95"
          aria-label="Close zoom"
        >
          <X className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-[10px] font-medium uppercase tracking-[0.2em] pointer-events-none text-center">
        Scroll to zoom • Drag to pan
      </div>
    </div>
  ) : null;

  return (
    <>
      <div 
        className={`relative overflow-hidden cursor-zoom-in group ${className}`}
        onClick={handleToggleZoom}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
           <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
             <Maximize2 className="w-6 h-6 text-brand-primary" />
           </div>
        </div>
      </div>

      {isZoomed && createPortal(overlay, document.body)}
    </>
  );
}


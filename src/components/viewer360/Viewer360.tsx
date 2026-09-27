'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  ArrowLeft, 
  Share2, 
  Layers, 
  Info, 
  PhoneCall, 
  Smartphone, 
  Check, 
  Eye, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';
import type { Product } from '@/types';
import { COMPANY_INFO } from '@/data/mockData';

export interface Scene360 {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  roomType?: string;
}

interface Viewer360Props {
  initialPanoramaUrl: string;
  product?: Product | null;
  scenes?: Scene360[];
  title?: string;
  subtitle?: string;
}

export default function Viewer360({
  initialPanoramaUrl,
  product,
  scenes = [],
  title,
  subtitle
}: Viewer360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(initialPanoramaUrl);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isGyroActive, setIsGyroActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showScenes, setShowScenes] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Generate QR code for mobile viewing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentFullUrl = window.location.href;
      QRCode.toDataURL(currentFullUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(setQrDataUrl).catch(console.error);
    }
  }, []);

  // Format image URL (use proxy if external without CORS)
  const getSafePanoUrl = useCallback((url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // If external domain, route through our CORS-safe proxy
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      if (!url.includes(currentHost) && !url.startsWith('/')) {
        return `/api/proxy-image?url=${encodeURIComponent(url)}`;
      }
    }
    return url;
  }, []);

  // Load Pannellum Script & CSS
  useEffect(() => {
    let isMounted = true;

    const loadPannellum = async () => {
      // 1. Ensure CSS is loaded
      if (!document.getElementById('pannellum-css')) {
        const link = document.createElement('link');
        link.id = 'pannellum-css';
        link.rel = 'stylesheet';
        link.href = '/libs/pannellum/pannellum.css';
        document.head.appendChild(link);
      }

      // 2. Ensure JS is loaded
      if (!(window as any).pannellum) {
        await new Promise((resolve, reject) => {
          const existingScript = document.getElementById('pannellum-js');
          if (existingScript) {
            existingScript.addEventListener('load', resolve);
            existingScript.addEventListener('error', reject);
            return;
          }
          const script = document.createElement('script');
          script.id = 'pannellum-js';
          script.src = '/libs/pannellum/pannellum.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      if (!isMounted) return;

      // 3. Initialize viewer
      initViewer(currentUrl);
    };

    loadPannellum().catch((err) => {
      console.error('Failed to load Pannellum:', err);
      if (isMounted) {
        setLoadError('Không thể khởi tạo bộ xem 360°. Vui lòng kiểm tra hỗ trợ WebGL trên trình duyệt.');
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
        viewerRef.current = null;
      }
    };
  }, []);

  const initViewer = useCallback((panoUrl: string) => {
    if (!containerRef.current || !(window as any).pannellum) return;

    setIsLoading(true);
    setLoadError(null);

    if (viewerRef.current) {
      try {
        viewerRef.current.destroy();
      } catch (e) {
        // ignore
      }
      viewerRef.current = null;
    }

    try {
      const safeUrl = getSafePanoUrl(panoUrl);
      const viewer = (window as any).pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: safeUrl,
        autoLoad: true,
        autoRotate: isAutoRotating ? -2.5 : 0,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        compass: false,
        mouseZoom: true,
        hfov: 100,
        minHfov: 45,
        maxHfov: 125,
        haov: 360,
        vaov: 180,
        friction: 0.15,
        touchPanSpeedCoeffFactor: 1.2,
        crossOrigin: 'anonymous'
      });

      viewer.on('load', () => {
        setIsLoading(false);
      });

      viewer.on('error', (err: any) => {
        console.error('Pannellum error event:', err);
        setLoadError('Không thể tải ảnh không gian 360°.');
        setIsLoading(false);
      });

      viewerRef.current = viewer;
    } catch (err: any) {
      console.error('Error initializing viewer:', err);
      setLoadError('Lỗi khởi tạo WebGL 360°.');
      setIsLoading(false);
    }
  }, [getSafePanoUrl, isAutoRotating]);

  // Handle scene change
  const handleSelectScene = (scene: Scene360) => {
    setCurrentUrl(scene.url);
    initViewer(scene.url);
  };

  // Toggle Auto-rotate
  const toggleAutoRotate = () => {
    if (!viewerRef.current) return;
    const nextState = !isAutoRotating;
    setIsAutoRotating(nextState);
    if (nextState) {
      viewerRef.current.startAutoRotate(-2.5);
    } else {
      viewerRef.current.stopAutoRotate();
    }
  };

  // Toggle Gyroscope (Device Orientation)
  const toggleGyro = () => {
    if (!viewerRef.current) return;
    const nextState = !isGyroActive;
    
    // Check iOS permission requirement for DeviceOrientation
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setIsGyroActive(nextState);
            if (nextState) {
              viewerRef.current.startOrientation();
            } else {
              viewerRef.current.stopOrientation();
            }
          } else {
            alert('Trình duyệt chưa được cấp quyền cảm biến con quay hồi chuyển.');
          }
        })
        .catch(console.error);
      return;
    }

    setIsGyroActive(nextState);
    if (nextState) {
      viewerRef.current.startOrientation();
    } else {
      viewerRef.current.stopOrientation();
    }
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    if (!viewerRef.current) return;
    const currentHfov = viewerRef.current.getHfov();
    const nextHfov = Math.max(45, Math.min(120, currentHfov + delta));
    viewerRef.current.setHfov(nextHfov, 500);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
        setIsFullscreen(false);
      }
    }
  };

  // Copy link
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const displayTitle = title || product?.name || 'Không gian trưng bày mẫu gạch 360°';
  const displaySubtitle = subtitle || (product ? `Mã: ${product.code} · ${product.sizes.join(', ')} · ${product.surface}` : 'Thương Sơn Ceramic Showroom VR');

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-stone-950 text-white select-none font-sans"
      onPointerDown={() => setHasInteracted(true)}
    >
      {/* Inline styles to override any default Pannellum branding cleanly */}
      <style jsx global>{`
        .pnlm-about-msg { display: none !important; }
        .pnlm-load-box { display: none !important; }
        .pnlm-container { background: #0c0a09 !important; }
        .pnlm-dragfix { cursor: grab !important; }
        .pnlm-dragfix:active { cursor: grabbing !important; }
      `}</style>

      {/* 360 Canvas Container */}
      <div 
        ref={containerRef} 
        id="panorama-container" 
        className="w-full h-full absolute inset-0 z-0"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-md transition-opacity duration-500">
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full border-3 border-transparent border-t-amber-400 border-r-amber-500 animate-spin" />
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <p className="text-stone-200 text-lg font-medium tracking-wide">Đang tải không gian 360°...</p>
          <p className="text-stone-400 text-xs mt-1">Đang tái hiện phối cảnh thực tế ảo độ phân giải cao</p>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-stone-950/90 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
            !
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Không thể tải không gian 360°</h3>
          <p className="text-stone-400 max-w-md text-sm mb-6">{loadError}</p>
          <button
            onClick={() => initViewer(currentUrl)}
            className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-sm transition-all shadow-lg"
          >
            Thử tải lại
          </button>
        </div>
      )}

      {/* Guide hint for first touch */}
      {!hasInteracted && !isLoading && !loadError && (
        <div className="absolute inset-x-0 bottom-28 z-10 flex justify-center pointer-events-none animate-bounce">
          <div className="bg-black/70 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full text-xs md:text-sm text-stone-200 shadow-2xl flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Vuốt hoặc kéo chuột để xoay 360° khám phá căn phòng</span>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <header className="absolute top-0 inset-x-0 z-10 p-3 md:p-5 flex items-center justify-between pointer-events-none">
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {product ? (
            <Link
              href={`/products/${product.slug}`}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all shadow-lg hover:scale-105 active:scale-95"
              title="Quay lại chi tiết sản phẩm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/catalog"
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all shadow-lg hover:scale-105 active:scale-95"
              title="Về danh mục sản phẩm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}

          <div className="bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl shadow-xl max-w-[260px] sm:max-w-sm md:max-w-md">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                360° VR
              </span>
              {product?.brand && (
                <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
            </div>
            <h1 className="text-xs md:text-sm font-bold text-white truncate leading-tight">
              {displayTitle}
            </h1>
            <p className="text-[11px] text-stone-400 truncate hidden sm:block">
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Mobile QR trigger button (useful when presenting on PC/tablet) */}
          <button
            onClick={() => setShowQRModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-xs text-stone-200 transition-all shadow-lg hover:text-white"
            title="Quét mã xem trên điện thoại"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline font-medium">Quét trên Mobile</span>
          </button>

          {/* Product Info trigger */}
          {product && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all shadow-lg ${
                showInfo 
                  ? 'bg-amber-500 border-amber-400 text-stone-950 font-bold' 
                  : 'bg-black/60 hover:bg-black/90 border-white/15 text-white'
              }`}
              title="Thông số mẫu gạch"
            >
              <Info className="w-5 h-5" />
            </button>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all shadow-lg relative"
            title="Sao chép liên kết"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            {copied && (
              <span className="absolute -bottom-8 right-0 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                Đã sao chép!
              </span>
            )}
          </button>
        </div>
      </header>

      {/* FLOATING CONTROLS DOCK (BOTTOM CENTER) */}
      <div className="absolute bottom-5 inset-x-0 z-10 flex justify-center pointer-events-none px-4">
        <div className="bg-black/70 backdrop-blur-xl border border-white/15 p-1.5 sm:p-2 rounded-2xl shadow-2xl flex items-center gap-1 sm:gap-2 pointer-events-auto">
          {/* Auto Rotate Toggle */}
          <button
            onClick={toggleAutoRotate}
            className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              isAutoRotating 
                ? 'bg-amber-500 text-stone-950 shadow-md font-semibold' 
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
            title="Bật/Tắt chế độ tự xoay"
          >
            <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            <span className="hidden sm:inline">Tự xoay</span>
          </button>

          {/* Gyroscope Mode for Mobile */}
          <button
            onClick={toggleGyro}
            className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              isGyroActive 
                ? 'bg-sky-500 text-white shadow-md font-semibold' 
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
            title="Con quay hồi chuyển (xoay điện thoại để đổi góc nhìn)"
          >
            <Compass className={`w-4 h-4 ${isGyroActive ? 'text-white' : ''}`} />
            <span className="hidden sm:inline">Cảm biến xoay</span>
          </button>

          <div className="w-[1px] h-5 bg-white/15 mx-0.5" />

          {/* Zoom In */}
          <button
            onClick={() => handleZoom(-12)}
            className="p-2 sm:p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-all"
            title="Phóng to chi tiết vân gạch"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => handleZoom(12)}
            className="p-2 sm:p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-all"
            title="Thu nhỏ toàn cảnh"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Scenes selector toggle if multiple scenes available */}
          {scenes.length > 1 && (
            <button
              onClick={() => setShowScenes(!showScenes)}
              className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                showScenes 
                  ? 'bg-white/20 text-white' 
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
              title="Đổi không gian phòng"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Không gian ({scenes.length})</span>
            </button>
          )}

          <div className="w-[1px] h-5 bg-white/15 mx-0.5" />

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-all"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SCENE SELECTOR STRIP (DRAWER) */}
      {showScenes && scenes.length > 1 && (
        <div className="absolute bottom-20 inset-x-0 z-20 flex justify-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-stone-900/90 backdrop-blur-xl border border-white/15 p-3 rounded-2xl shadow-2xl max-w-xl w-full flex items-center gap-3 overflow-x-auto">
            {scenes.map((scene) => {
              const isSelected = currentUrl === scene.url;
              return (
                <button
                  key={scene.id}
                  onClick={() => handleSelectScene(scene)}
                  className={`flex-shrink-0 group relative rounded-xl overflow-hidden border-2 transition-all p-1 text-left ${
                    isSelected 
                      ? 'border-amber-400 bg-amber-500/10' 
                      : 'border-white/10 hover:border-white/30 bg-black/40'
                  }`}
                >
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-stone-800 relative">
                    {scene.thumbnail ? (
                      <img 
                        src={scene.thumbnail} 
                        alt={scene.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-500">
                        <Eye className="w-5 h-5" />
                      </div>
                    )}
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-stone-950" />
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-stone-200 mt-1 truncate max-w-[96px]">
                    {scene.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PRODUCT SPECIFICATION DRAWER */}
      {showInfo && product && (
        <div className="absolute top-20 right-4 z-20 w-80 max-w-[calc(100vw-32px)] bg-stone-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between mb-3 border-b border-white/10 pb-2">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {product.brand || 'Thương Sơn Ceramic'}
              </span>
              <h3 className="text-sm font-bold text-white leading-snug">
                {product.name}
              </h3>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs text-stone-300">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-stone-400">Mã sản phẩm:</span>
              <span className="font-semibold text-amber-300">{product.code}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-stone-400">Kích thước:</span>
              <span className="font-medium">{product.sizes?.join(', ') || '1200x1800mm'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-stone-400">Bề mặt:</span>
              <span className="font-medium">{product.surface || 'Bóng kiếng (Glossy)'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-stone-400">Chất liệu:</span>
              <span className="font-medium">{product.material || 'Granite / Marble Porcelain'}</span>
            </div>
            {product.technicalSpecs?.facesCount && (
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Số faces vân:</span>
                <span className="font-medium">{product.technicalSpecs.facesCount} faces ngẫu nhiên</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-2 flex flex-col gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors shadow-lg"
            >
              <span>Xem trang sản phẩm</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <a
              href={COMPANY_INFO.phones[0].zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 font-medium text-xs text-center flex items-center justify-center gap-1.5 transition-colors border border-white/10"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tư vấn & Nhận báo giá</span>
            </a>
          </div>
        </div>
      )}

      {/* MOBILE QR CODE MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-stone-900 border border-white/15 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full bg-white/5"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Trải nghiệm VR 360° trên điện thoại
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Mở camera hoặc Zalo trên điện thoại để quét mã bên dưới. Khi xoay điện thoại trong tay, góc nhìn căn phòng sẽ tự động xoay theo!
            </p>

            {qrDataUrl && (
              <div className="bg-white p-3 rounded-2xl inline-block shadow-inner mb-4">
                <img src={qrDataUrl} alt="QR Code 360" className="w-48 h-48 mx-auto" />
              </div>
            )}

            <p className="text-[11px] text-amber-400/90 font-medium flex items-center justify-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Hỗ trợ con quay hồi chuyển Gyroscope 360°
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

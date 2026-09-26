import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { 
  X, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Trash2, 
  Check, 
  RefreshCw, 
  RotateCw,
  AlertCircle,
  User,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from './Button';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentAvatar?: string;
  userName: string;
  onSaveAvatar: (avatarUrl: string) => void;
}

// Curated avatar presets categorized by demographics and styles
export const PRESET_AVATARS = [
  // Men
  {
    id: 'm1',
    label: 'Male 1',
    category: 'Male',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'm2',
    label: 'Male 2',
    category: 'Male',
    url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'm3',
    label: 'Male 3',
    category: 'Male',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'm4',
    label: 'Male 4',
    category: 'Male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'm5',
    label: 'Male Senior',
    category: 'Senior',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'm6',
    label: 'Male Doctor',
    category: 'Medical',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
  },
  
  // Women
  {
    id: 'w1',
    label: 'Female 1',
    category: 'Female',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'w2',
    label: 'Female 2',
    category: 'Female',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'w3',
    label: 'Female 3',
    category: 'Female',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'w4',
    label: 'Female Hijab',
    category: 'Female',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'w5',
    label: 'Female Senior',
    category: 'Senior',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'w6',
    label: 'Female Doctor',
    category: 'Medical',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
  },

  // 3D / Illustrated
  {
    id: 'art1',
    label: 'Illustrated 1',
    category: 'Art',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'art2',
    label: 'Illustrated 2',
    category: 'Art',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'art3',
    label: 'Health Badge',
    category: 'Art',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=200'
  }
];

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentAvatar,
  userName,
  onSaveAvatar
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets' | 'url'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar || '');
  const [previewAvatar, setPreviewAvatar] = useState<string>(currentAvatar || '');
  const [customUrl, setCustomUrl] = useState('');
  const [urlStatus, setUrlStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar || '');
      setPreviewAvatar(currentAvatar || '');
      setErrorMsg(null);
      setUrlStatus('idle');
      setCustomUrl('');
    } else {
      stopCamera();
    }
  }, [isOpen, currentAvatar]);

  // Clean up camera on tab change or unmount
  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async (facing: 'user' | 'environment' = 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        lang === 'bn' 
          ? 'ক্যামেরা চালু করা যায়নি। অনুগ্রহ করে ক্যামেরার অনুমতি চেক করুন।' 
          : 'Could not access camera. Please check camera permissions.'
      );
      setIsCameraActive(false);
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight) || 400;
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop square
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 300, 300);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setPreviewAvatar(dataUrl);
    setSelectedAvatar(dataUrl);
    stopCamera();
  };

  // Handle local file upload with client-side compression
  const handleFileUpload = (file: File) => {
    setErrorMsg(null);

    if (!file.type.startsWith('image/')) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন।' : 'Please select an image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg(lang === 'bn' ? 'ছবির সাইজ ৮ মেগাবাইটের কম হতে হবে।' : 'Image size must be under 8MB.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320; // High resolution square for profile avatar
        canvas.width = maxDim;
        canvas.height = maxDim;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, maxDim, maxDim);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setPreviewAvatar(compressedDataUrl);
        setSelectedAvatar(compressedDataUrl);
        setIsProcessing(false);
      };

      img.onerror = () => {
        setIsProcessing(false);
        setErrorMsg(lang === 'bn' ? 'ছবিটি লোড করা সম্ভব হয়নি।' : 'Failed to process image.');
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMsg(lang === 'bn' ? 'ফাইল পড়ার সময় ত্রুটি হয়েছে।' : 'Error reading file.');
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleValidateUrl = () => {
    if (!customUrl.trim()) return;
    setUrlStatus('validating');
    setErrorMsg(null);

    const img = new Image();
    img.onload = () => {
      setUrlStatus('valid');
      setPreviewAvatar(customUrl.trim());
      setSelectedAvatar(customUrl.trim());
    };
    img.onerror = () => {
      setUrlStatus('invalid');
      setErrorMsg(lang === 'bn' ? 'ইমেজ লিঙ্কটি সঠিক নয় বা কাজ করছে না।' : 'Invalid or inaccessible image link.');
    };
    img.src = customUrl.trim();
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar('');
    setPreviewAvatar('');
  };

  if (!isOpen) return null;

  const initials = (userName || 'P')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'P';

  const categories = ['All', 'Male', 'Female', 'Senior', 'Medical', 'Art'];
  const filteredPresets = filterCategory === 'All' 
    ? PRESET_AVATARS 
    : PRESET_AVATARS.filter(p => p.category === filterCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-primary flex items-center justify-center font-bold">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                {lang === 'bn' ? 'প্রোফাইল ছবি পরিবর্তন ও যোগ করুন' : 'Update Profile Picture'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {lang === 'bn' ? 'ছবি আপলোড করুন, ক্যামেরা দিয়ে তুলুন অথবা পছন্দমতো অ্যাভাটার বাছুন' : 'Upload photo, snap from camera, or pick a curated avatar'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Profile Preview Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {previewAvatar ? (
                <img 
                  src={previewAvatar} 
                  alt="Profile Preview" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-sm"
                  onError={() => setPreviewAvatar('')}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 to-primary text-white font-black text-lg flex items-center justify-center border-2 border-primary/30 shadow-sm">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700 block">{userName || 'Patient'}</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                {previewAvatar ? (
                  <span className="text-primary font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} /> {lang === 'bn' ? 'ছবি নির্বাচিত হয়েছে' : 'Picture selected'}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {lang === 'bn' ? 'ডিফল্ট ইনিশিয়াল অ্যাভাটার' : 'Default initials avatar'}
                  </span>
                )}
              </span>
            </div>
          </div>

          {previewAvatar && (
            <button
              onClick={handleRemoveAvatar}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 flex items-center gap-1.5 font-semibold transition-all"
              title={lang === 'bn' ? 'ছবি মুছে ফেলুন' : 'Remove Picture'}
            >
              <Trash2 size={13} />
              <span>{lang === 'bn' ? 'মুছুন' : 'Remove'}</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/40 px-6 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-primary text-primary bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload size={14} />
            <span>{lang === 'bn' ? 'ফাইল আপলোড' : 'Upload File'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera(facingMode);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'camera'
                ? 'border-primary text-primary bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera size={14} />
            <span>{lang === 'bn' ? 'ক্যামেরা' : 'Take Photo'}</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-primary text-primary bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>{lang === 'bn' ? 'অ্যাভাটার গ্যালারি' : 'Avatar Gallery'}</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'url'
                ? 'border-primary text-primary bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon size={14} />
            <span>{lang === 'bn' ? 'ওয়েব লিঙ্ক' : 'Image URL'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. FILE UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sky-200 hover:border-primary bg-sky-50/40 hover:bg-sky-50/80 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all mb-3 border border-sky-100">
                  <Upload size={24} />
                </div>
                
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  {lang === 'bn' ? 'ছবি নির্বাচন করতে ক্লিক করুন বা টেনে আনুন' : 'Click or drag & drop photo here'}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  {lang === 'bn' ? 'JPG, PNG বা WEBP (সর্বোচ্চ ৮ মেগাবাইট)। স্বয়ংক্রিয়ভাবে ক্রপ ও অপ্টিমাইজ হবে।' : 'JPG, PNG or WEBP (Max 8MB). Automatically squared and optimized.'}
                </p>
              </div>

              {isProcessing && (
                <div className="text-center py-2 text-xs font-semibold text-primary flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>{lang === 'bn' ? 'ছবি প্রসেস করা হচ্ছে...' : 'Processing image...'}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-4 flex flex-col items-center">
              {cameraError ? (
                <div className="w-full p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs space-y-2 text-center">
                  <p className="font-bold">{cameraError}</p>
                  <Button 
                    onClick={() => startCamera(facingMode)} 
                    variant="outline" 
                    className="text-xs !py-1.5"
                  >
                    <RefreshCw size={12} className="mr-1" /> {lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Camera'}
                  </Button>
                </div>
              ) : isCameraActive ? (
                <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-slate-900 border-2 border-primary aspect-square flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder Circle Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-[32px] border-slate-900/40 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-2 border-white/80 shadow-2xl"></div>
                  </div>

                  {/* Camera Controls */}
                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={flipCamera}
                      className="p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-all border border-white/20"
                      title="Flip Camera"
                    >
                      <RotateCw size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="p-3.5 rounded-full bg-primary hover:bg-sky-500 text-white shadow-lg shadow-sky-600/50 hover:scale-105 active:scale-95 transition-all border-2 border-white"
                      title="Take Snapshot"
                    >
                      <Camera size={22} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-sky-50 text-primary flex items-center justify-center mx-auto border border-sky-100">
                    <Camera size={30} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {lang === 'bn' ? 'ক্যামেরা চালু করুন' : 'Start Camera'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    {lang === 'bn' ? 'আপনার ল্যাপটপ বা মোবাইলের ক্যামেরা দিয়ে সরাসরি সেলফি তুলুন।' : 'Take a quick live photo using your phone or laptop camera.'}
                  </p>
                  <Button onClick={() => startCamera(facingMode)} className="text-xs font-bold">
                    <Camera size={14} className="mr-1.5" />
                    {lang === 'bn' ? 'ক্যামেরা ওপেন করুন' : 'Open Camera'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 3. PRESETS GALLERY TAB */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Filter pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      filterCategory === cat
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Avatars */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-60 overflow-y-auto p-1">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedAvatar === preset.url || previewAvatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(preset.url);
                        setPreviewAvatar(preset.url);
                      }}
                      className={`group relative rounded-2xl p-1 border-2 transition-all text-center flex flex-col items-center ${
                        isSelected 
                          ? 'border-primary bg-sky-50 ring-2 ring-primary/30 scale-105' 
                          : 'border-transparent hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.label} 
                        className="w-14 h-14 rounded-full object-cover shadow-xs group-hover:scale-105 transition-transform" 
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. IMAGE URL TAB */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {lang === 'bn' ? 'অনলাইন ছবির লিঙ্ক দিন' : 'Direct Image Web URL'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="url" 
                      value={customUrl} 
                      onChange={(e) => {
                        setCustomUrl(e.target.value);
                        setUrlStatus('idle');
                      }}
                      placeholder="https://example.com/my-photo.jpg"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-primary focus:bg-white outline-none" 
                    />
                    <LinkIcon size={15} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                  <Button 
                    onClick={handleValidateUrl} 
                    disabled={!customUrl.trim() || urlStatus === 'validating'}
                    variant="outline" 
                    className="text-xs font-bold flex-shrink-0"
                  >
                    {urlStatus === 'validating' ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <span>{lang === 'bn' ? 'চেক করুন' : 'Preview'}</span>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'bn' ? 'যেকোনো পাবলিক ফটো লিঙ্ক যেমন Google Drive, Unsplash বা Imgur ইমেজ লিঙ্ক।' : 'Any publicly accessible image link.'}
                </p>
              </div>

              {urlStatus === 'valid' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{lang === 'bn' ? 'ছবি সফলভাবে লোড হয়েছে!' : 'Image loaded successfully!'}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className="text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </Button>

          <Button 
            onClick={handleSave} 
            className="text-xs font-bold px-6 shadow-md flex items-center gap-2"
          >
            <Check size={16} />
            <span>{lang === 'bn' ? 'প্রোফাইল ছবি নিশ্চিত করুন' : 'Apply Picture'}</span>
          </Button>
        </div>

      </div>
    </div>
  );
};

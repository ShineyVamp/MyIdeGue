import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Image as ImageIcon, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { CARD_SHADOW, INPUT_SHADOW } from './Shadows';

// --- CHANGE: Import API_URL ---
import { API_URL } from '../config/api';

const CreatePostModal = ({ isOpen, onClose, onPost, currentUser }) => {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[3] || 'Fun');
  const [showCatMenu, setShowCatMenu] = useState(false);

  // State Images
  const [images, setImages] = useState([]); 
  const [viewerSrc, setViewerSrc] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setImages([]);
      setSelectedCategory(CATEGORIES[3] || 'Fun');
      setUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- LOGIC UPLOAD GAMBAR ---
  const handleFileSelect = async (fileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploading(true);
    const token = localStorage.getItem('token');
    
    // Cek Token Login
    if (!token) {
        alert("Sesi habis. Silakan login ulang.");
        setUploading(false);
        return;
    }

    const uploadedUrls = [];

    // Loop upload file satu per satu
    for (const file of files) {
        const formData = new FormData();
        formData.append('image', file); 

        try {
            console.log("Uploading...", file.name);

            // --- CHANGE: Gunakan API_URL ---
            const res = await fetch(`${API_URL}/posts/upload-image`, {
                method: 'POST',
                headers: { 
                    'Authorization': token 
                },
                body: formData
            });
            
            const data = await res.json();

            if (!res.ok) {
                console.error("Server Error:", data);
                alert(`Gagal Upload: ${data.message || 'Error Server'}`);
                continue; 
            }

            console.log("Success:", data.url);
            uploadedUrls.push(data.url);

        } catch (err) {
            console.error("Network Error:", err);
            alert("Gagal terhubung ke server backend. Pastikan server nyala!");
        }
    }

    setImages(prev => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  // --- DRAG & DROP LOGIC ---
  const dragIndexRef = useRef(null);
  const handleDragStart = (e, idx) => { dragIndexRef.current = idx; e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, idx) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === undefined) return;
    setImages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(idx, 0, item);
      return arr;
    });
    dragIndexRef.current = null;
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onPost({ content, category: selectedCategory, images });
    setContent('');
    setImages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose}></div>

      <div className={`relative bg-white w-full max-w-xl rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl ${CARD_SHADOW}`}>
        <button onClick={onClose} className="absolute top-8 left-8 p-2 bg-gray-50 rounded-full hover:bg-gray-200">
          <X size={20} />
        </button>

        <h2 className="text-center font-black text-xl mb-10 uppercase tracking-widest">KIRIM IDE KAMU</h2>

        {/* User Info */}
        <div className="flex items-start gap-5 mb-6">
          <img src={currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} alt="Me" className="w-12 h-12 rounded-full object-cover border shadow-sm" />
          <div className="flex flex-col gap-2 pt-1">
            <span className="font-bold text-sm">@{currentUser?.handle || 'Guest'}</span>
            <div className="relative z-20">
              <button onClick={() => setShowCatMenu(!showCatMenu)} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold hover:bg-gray-100 transition-colors">
                {selectedCategory}
                <ChevronDown size={14} className={`${showCatMenu ? 'rotate-180' : ''}`} />
              </button>
              {showCatMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border rounded-2xl shadow-xl py-2 min-w-[160px] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <button key={cat} onClick={() => { setSelectedCategory(cat); setShowCatMenu(false); }} className="block w-full text-left px-5 py-3 text-xs hover:bg-blue-50 font-bold text-gray-700">
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Text Input */}
        <div className={`bg-gray-50 rounded-[1.5rem] p-2 mb-4 ${INPUT_SHADOW}`}>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder="Ketik idemu disini........." 
            className="w-full h-32 resize-none p-4 text-base bg-transparent focus:outline-none" 
          />
        </div>

        {/* Image Preview Grid */}
        {(images.length > 0 || uploading) && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {images.map((src, idx) => (
              <div key={idx} draggable onDragStart={(e) => handleDragStart(e, idx)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, idx)} className="relative group rounded-2xl overflow-hidden cursor-pointer aspect-square border">
                <img src={src} alt="" className="w-full h-full object-cover" onClick={() => setViewerSrc(src)} />
                <button onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow">
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {/* Loading Placeholder */}
            {uploading && (
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border aspect-square gap-2">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                    <span className="text-[10px] text-gray-400 font-bold">Uploading...</span>
                </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <label className={`p-3 hover:bg-gray-100 rounded-2xl border-2 border-black cursor-pointer flex items-center gap-2 ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
            <ImageIcon size={20} />
            <span className="text-xs font-bold">Tambah Gambar</span>
            <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={(e) => !uploading && handleFileSelect(e.target.files)} 
                disabled={uploading}
            />
          </label>

          <button 
            onClick={handleSubmit} 
            disabled={!content.trim() || uploading} 
            className="bg-white text-black text-xs font-black px-14 py-4 rounded-full border-2 border-gray-100 uppercase disabled:opacity-50 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            Kirim
          </button>
        </div>
      </div>

      {/* Image Viewer Overlay */}
      {viewerSrc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110]" onClick={() => setViewerSrc(null)}>
          <img src={viewerSrc} className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in" />
        </div>
      )}
    </div>
  );
};

export default CreatePostModal;
import React, { useState, useEffect, useRef } from 'react';
import { X, PenLine, Loader2 } from 'lucide-react'; 

// --- CHANGE: Import API_URL ---
import { API_URL } from '../config/api';

const EditProfileModal = ({ isOpen, onClose, currentUser, onSave }) => {
  const [username, setUsername] = useState('');
  const [badge, setBadge] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploading, setUploading] = useState(false); 
  
  const fileInputRef = useRef(null);

  useEffect(() => {
      if (isOpen && currentUser) {
          setUsername(currentUser.handle);
          setBadge(currentUser.badge);
          setAvatar(currentUser.avatar);
      }
  }, [isOpen, currentUser]);

  const handleSave = () => {
      onSave({
          handle: username,
          badge: badge,
          avatar: avatar 
      });
      onClose();
  };

  // --- LOGIC UPLOAD KE BACKEND ---
  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true); 

      const formData = new FormData();
      formData.append('avatar', file);

      try {
          // --- CHANGE: Gunakan API_URL ---
          const res = await fetch(`${API_URL}/users/upload-avatar`, {
              method: 'POST',
              body: formData
          });

          const data = await res.json();
          
          if (res.ok) {
              setAvatar(data.url); 
          } else {
              alert('Gagal upload gambar');
          }
      } catch (err) {
          console.error(err);
          alert('Terjadi kesalahan saat upload');
      } finally {
          setUploading(false); 
      }
  };

  const triggerFileInput = () => {
      fileInputRef.current.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-[#F9F9F9] w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button 
            onClick={onClose}
            className="absolute top-8 left-8 text-black hover:opacity-60 transition-opacity"
        >
            <X size={24} />
        </button>

        <h2 className="text-center font-bold text-lg mb-12 uppercase tracking-wider text-black">EDIT PROFILE</h2>

        {/* AREA GAMBAR */}
        <div className="flex justify-center mb-10">
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <div className="relative w-32 h-32">
                    <img 
                        src={avatar} 
                        alt="Me" 
                        className={`w-full h-full rounded-full object-cover border-4 border-white shadow-sm transition-opacity ${uploading ? 'opacity-50' : 'opacity-90 group-hover:opacity-70'}`} 
                    />
                    
                    {/* Loading Indicator */}
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="animate-spin text-black" size={32} />
                        </div>
                    )}
                </div>
                
                <button 
                    type="button"
                    className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 text-black transition-transform hover:scale-105"
                >
                    <PenLine size={18} />
                </button>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-black mb-2 pl-1">Username (Handle)</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#E3E3E3] border-none rounded-xl py-3.5 px-6 text-black font-bold focus:ring-0 shadow-inner"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-2 pl-1">Sebutan Lau (Badge)</label>
                <input 
                    type="text" 
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-[#E3E3E3] border-none rounded-xl py-3.5 px-6 text-gray-500 font-bold focus:ring-0 shadow-inner"
                />
            </div>
        </div>

        <div className="mt-14 flex justify-end">
             <button 
                onClick={handleSave}
                disabled={uploading}
                className="bg-white border border-gray-200 text-black text-xs font-bold px-12 py-3.5 rounded-full hover:bg-gray-50 shadow-sm transition-all tracking-widest uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? 'UPLOADING...' : 'SIMPAN'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
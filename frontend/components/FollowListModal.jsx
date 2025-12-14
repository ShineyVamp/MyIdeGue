import React from 'react';
import { X, UserMinus, UserCheck } from 'lucide-react';
import { CARD_SHADOW } from './Shadows';

// Terima onUserClick
const FollowListModal = ({ isOpen, onClose, title, users = [], listType, onAction, onUserClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh] ${CARD_SHADOW}`}>
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-xl text-black uppercase tracking-wide">{title}</h2>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4">
            {users.length > 0 ? (
                users.map((user) => (
                    <div 
                        key={user.id} 
                        // CLICK EVENT untuk navigasi ke profil
                        onClick={() => {
                            if (onUserClick) {
                                onUserClick(user.id);
                                onClose(); // Tutup modal setelah klik
                            }
                        }}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-4 pointer-events-none">
                            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-gray-200"/>
                            <div>
                                <p className="font-bold text-sm text-black">{user.handle}</p>
                                <p className="text-[11px] text-gray-400 font-medium">{user.badge || 'Warga Sipil'}</p>
                            </div>
                        </div>

                        {listType === 'followers' && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Cegah navigasi saat klik tombol remove
                                    onAction(user.id);
                                }}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-black hover:text-red-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            >
                                <UserMinus size={14} /> Remove
                            </button>
                        )}

                        {listType === 'following' && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Cegah navigasi
                                    onAction(user.id);
                                }}
                                className="px-3 py-1.5 border border-gray-200 text-green-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 group"
                            >
                                <span className="group-hover:hidden flex items-center gap-1"><UserCheck size={14} /> Following</span>
                                <span className="hidden group-hover:flex items-center gap-1"><UserMinus size={14} /> Unfollow</span>
                            </button>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center py-10 text-gray-400 text-sm italic">
                    Empty
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
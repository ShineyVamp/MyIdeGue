import React, { useState } from 'react';
import { ArrowBigUp, MessageCircle, X, ChevronLeft, ChevronRight, CheckCircle, Trash2, AlertTriangle, Flag } from 'lucide-react';
import { CARD_SHADOW, INPUT_SHADOW } from './Shadows';

// --- Import API_URL ---
import { API_URL } from '../config/api';

const PostImage = ({ src, onClick }) => {
  const [imgClass, setImgClass] = useState("w-64 h-64 object-cover"); 
  const [isLoaded, setIsLoaded] = useState(false);
  
  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const ratio = naturalWidth / naturalHeight;
    const isSquare = ratio >= 0.9 && ratio <= 1.1;      
    const isPortrait = ratio >= 0.6 && ratio <= 0.75;   
    const isLandscape = ratio >= 1.7 && ratio <= 1.85;  
    if (isSquare || isPortrait || isLandscape) { 
        setImgClass("h-64 w-auto object-contain bg-gray-50"); 
    } else { 
        setImgClass("w-64 h-64 object-cover"); 
    }
    setIsLoaded(true);
  };

  return (
    <img 
        src={src} 
        alt="" 
        onLoad={handleImageLoad} 
        onClick={onClick} 
        className={`rounded-2xl border border-gray-200 flex-shrink-0 cursor-pointer transition-opacity duration-300 ${imgClass} ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
    />
  );
};

const IdeaCard = ({ post, onClick, onDelete, onVote, currentUser, onUserClick }) => {
  
  const postUser = {
      id: post.userId,
      name: post.name || 'Unknown',
      handle: post.handle || '@unknown',
      avatar: post.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
      badge: post.badge || 'Warga Sipil'
  };

  const isOwner = currentUser && currentUser.id === post.userId;
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin; 

  const hasVoted = post.userVote; 
  const voteCount = post.upvotes;
  const images = post.images || [];

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charCount = reportReason.length; 
  const maxChars = 300; 
  const isOverLimit = charCount > maxChars;

  const openViewer = (idx) => { setViewerIndex(idx); setViewerOpen(true); };
  const closeViewer = () => setViewerOpen(false);
  const prevImage = () => setViewerIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setViewerIndex((i) => (i + 1) % images.length);
  
  const handleVoteClick = (type) => { 
      if (onVote) {
          if (navigator.vibrate) navigator.vibrate(50);
          onVote(post.id, type); 
      }
  };

  const handleSubmitReport = async () => { 
      if (!reportReason.trim() || isOverLimit) return; 
      
      setIsSubmitting(true);
      const token = localStorage.getItem('token');

      try {
          const res = await fetch(`${API_URL}/reports`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': token 
              },
              body: JSON.stringify({
                  target_id: post.id,
                  target_type: 'post',
                  reason: reportReason
              })
          });

          if (res.ok) {
              setShowReportModal(false); 
              setShowSuccessToast(true); 
              setReportReason(""); 
              setTimeout(() => { setShowSuccessToast(false); }, 2500); 
          } else {
              alert("Failed to submit report.");
          }
      } catch (err) {
          console.error(err);
          alert("Error connecting to server.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDeletePost = () => { 
      setShowDeleteConfirm(false); 
      if (onDelete) onDelete(post.id); 
  };

  return (
    <>
    <div 
        onClick={onClick} 
        className={`bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300 relative`}
    >
      
      <div className="flex justify-between items-start mb-6 relative">
        <div className="flex gap-4">
          <img 
            src={postUser.avatar} 
            alt={postUser.name} 
            onClick={(e) => { e.stopPropagation(); onUserClick && onUserClick(post.userId); }}
            className="w-11 h-11 rounded-full object-cover border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity" 
          />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
                <p 
                    onClick={(e) => { e.stopPropagation(); onUserClick && onUserClick(post.userId); }}
                    className="font-bold text-sm text-black hover:underline cursor-pointer"
                >
                    {postUser.handle}
                </p>
                <span className="text-xs text-gray-400 font-light">{post.timestamp}</span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">{postUser.badge}</p>
          </div>
        </div>
        
        {post.category && (
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                {post.category}
            </span>
        )}
      </div>

      <div className="mb-4 pl-1">
          <p className="text-black text-[15px] font-medium leading-relaxed tracking-wide whitespace-pre-line">
            {post.content}
          </p>
      </div>

      {images.length > 0 && (
        <div className="mt-4 overflow-x-auto flex gap-3 pb-2 items-start" onClick={(e) => e.stopPropagation()}>
          {images.map((img, idx) => (<PostImage key={idx} src={img} onClick={() => openViewer(idx)} />))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
            
            <div className="flex items-center bg-[#F3F4F6] rounded-full px-3 py-1.5 gap-1 border border-transparent hover:border-gray-300 transition-colors" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => handleVoteClick('up')} 
                    className={`p-1.5 rounded-full transition-all duration-200 active:scale-75 ${hasVoted === 'up' ? 'text-green-600 bg-white shadow-sm' : 'text-black hover:bg-white hover:text-green-600'}`}
                >
                    <ArrowBigUp size={22} className={`stroke-[2px] transition-transform duration-200 ${hasVoted === 'up' ? 'fill-green-600 scale-110' : ''}`} />
                </button>

                <span className={`font-bold text-sm min-w-[20px] text-center transition-colors duration-300 ${hasVoted === 'up' ? 'text-green-600' : hasVoted === 'down' ? 'text-red-500' : 'text-black'}`}>
                    {voteCount}
                </span>

                <button 
                    onClick={() => handleVoteClick('down')} 
                    className={`p-1.5 rounded-full transition-all duration-200 active:scale-75 ${hasVoted === 'down' ? 'text-red-500 bg-white shadow-sm' : 'text-black hover:bg-white hover:text-red-500'}`}
                >
                    <ArrowBigUp size={22} className={`rotate-180 stroke-[2px] transition-transform duration-200 ${hasVoted === 'down' ? 'fill-red-500 scale-110' : ''}`} />
                </button>
            </div>

            <div className="flex items-center bg-[#F3F4F6] rounded-full px-5 py-3 gap-2 border border-transparent hover:border-gray-300 hover:bg-gray-200 transition-all">
                {/* --- FIX: Gunakan post.commentCount jika ada, fallback ke 0 --- */}
                <span className="font-bold text-sm text-black">{post.commentCount !== undefined ? post.commentCount : 0}</span>
                <MessageCircle size={20} className="text-black stroke-[2px] scale-x-[-1]" />
            </div>
        </div>

        {canDelete ? (
             <button 
                className="flex items-center gap-1 text-xs text-red-500 font-bold hover:text-red-700 transition-colors px-3 py-1 rounded-full hover:bg-red-50" 
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
             >
                <Trash2 size={14} /> Delete
             </button>
        ) : (
            <button 
                className="flex items-center gap-1 text-xs text-gray-400 font-bold hover:text-red-500 transition-colors px-3 py-1 rounded-full hover:bg-red-50" 
                onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }}
            >
                <Flag size={14}/> Report
            </button>
        )}
      </div>

      {viewerOpen && images.length > 0 && (
        <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4">
          <button onClick={(e) => { e.stopPropagation(); closeViewer(); }} className="absolute top-6 right-6 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"><X size={20} className="text-white" /></button>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50"><ChevronLeft size={24} className="text-white" /></button>
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50"><ChevronRight size={24} className="text-white" /></button>
          <div className="max-w-[90vw] max-h-[90vh]">
            <img src={images[viewerIndex]} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()}/>
            <div className="flex justify-center gap-2 mt-4">{images.map((_, i) => (<button key={i} onClick={(e) => { e.stopPropagation(); setViewerIndex(i); }} className={`w-2 h-2 rounded-full ${i === viewerIndex ? 'bg-white' : 'bg-white/40'}`} />))}</div>
          </div>
        </div>
      )}
    </div>

    {showDeleteConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={(e) => {e.stopPropagation(); setShowDeleteConfirm(false)}}></div>
            <div className={`relative bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-200 ${CARD_SHADOW}`}>
                 <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500"><AlertTriangle size={28} /></div>
                 <h3 className="text-xl font-black text-black mb-2">Delete this post?</h3>
                 <p className="text-sm text-gray-500 mb-8 font-medium">This action cannot be undone.</p>
                 <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-black font-bold text-sm hover:bg-gray-50 transition-colors">No</button>
                    <button onClick={handleDeletePost} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg transition-colors">Yes, Delete</button>
                 </div>
            </div>
        </div>
    )}

    {showReportModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setShowReportModal(false); }}></div>
            <div className={`relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200 ${CARD_SHADOW}`} onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-black">What does this post violate?</h3>
                    <button onClick={() => setShowReportModal(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors"><X size={20} /></button>
                </div>
                
                <div className={`bg-gray-50 rounded-[1.5rem] p-4 mb-4 ${INPUT_SHADOW}`}>
                    <textarea 
                        value={reportReason} 
                        onChange={(e) => setReportReason(e.target.value)} 
                        placeholder="Write your reason here..." 
                        className="w-full h-32 resize-none bg-transparent text-sm focus:outline-none p-2"
                    />
                </div>
                
                <div className="flex justify-between items-center mb-6 px-2">
                    <span className={`text-xs font-bold ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>{charCount} / {maxChars} karakter</span>
                    {isOverLimit && <span className="text-xs font-bold text-red-500">Character limit exceeded!</span>}
                </div>
                
                <button 
                    onClick={handleSubmitReport} 
                    disabled={!reportReason.trim() || isOverLimit || isSubmitting} 
                    className="w-full bg-black text-white text-sm font-bold py-4 rounded-full hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                    {isSubmitting ? 'Sending Report...' : 'Submit Report'}
                </button>
            </div>
        </div>
    )}

    {showSuccessToast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
             <div className="bg-white/95 backdrop-blur-md border border-green-100 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"><CheckCircle size={32} /></div>
                <h4 className="text-lg font-black text-black mb-2">Report Sent!</h4>
                <p className="text-sm text-gray-600 font-medium">Thank you. We will review this post shortly.</p>
             </div>
        </div>
    )}
    </>
  );
};

export default IdeaCard;
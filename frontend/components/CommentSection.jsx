import React, { useState } from 'react';
import { ArrowBigUp, Trash2, AlertTriangle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { CARD_SHADOW } from './Shadows';

const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds} sec ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CommentNode = ({ comment, currentUser, onUserClick, onReply, onDelete, onVote, depth = 0 }) => {
  const user = {
      id: comment.user_id,
      name: comment.name || 'Unknown',
      handle: comment.handle || '@unknown',
      avatar: comment.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
      badge: comment.badge || 'Warga Sipil'
  };

  const isOwner = currentUser && currentUser.id === comment.user_id;
  const isAdmin = currentUser?.role === 'admin'; 
  const canDelete = isOwner || isAdmin; 

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const [replyContent, setReplyContent] = useState("");
  
  // State Hide/Show Reply
  const [showReplies, setShowReplies] = useState(false); 
  const replyCount = comment.replies ? comment.replies.length : 0;

  const handleSubmitReply = () => {
      if(replyContent.trim()) {
          onReply(comment.id, replyContent);
          setReplyContent("");
          setShowReplyInput(false);
          setShowReplies(true); 
      }
  };

  const handleDeleteClick = () => { setShowDeleteConfirm(true); };
  
  // --- FIX: KIRIM STATUS 'isRoot' KE PARENT ---
  const confirmDelete = () => { 
      // depth === 0 artinya ini adalah Root Comment (Komentar Utama)
      onDelete(comment.id, depth === 0); 
      setShowDeleteConfirm(false); 
  };

  const hasVoted = comment.userVote; 
  const score = comment.score || 0;

  return (
    <>
    <div className={`mt-4 ${depth > 0 ? 'ml-6' : ''}`}>
      <div className="relative">
          {/* Garis konektor visual */}
          {depth > 0 && (
             <div className="absolute -left-6 top-6 w-4 h-[2px] bg-gray-200 rounded-full"></div>
          )}
          
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300 relative group">
            
            <div className="flex items-center gap-3 mb-2">
                <img 
                src={user.avatar} 
                alt={user.name} 
                onClick={() => onUserClick && onUserClick(user.id)}
                className="w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                />
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <p 
                            className="font-bold text-sm text-black cursor-pointer hover:underline"
                            onClick={() => onUserClick && onUserClick(user.id)}
                        >
                            {user.handle}
                        </p>
                        <span className="text-[10px] text-gray-400 font-normal">
                            {formatTimeAgo(comment.created_at)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="pl-1 mb-3">
                <p className="text-sm text-black font-medium leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Vote Controls */}
                    <div className="flex items-center bg-[#F3F4F6] rounded-full px-2 py-1 gap-1 border border-transparent hover:border-gray-300 transition-colors cursor-pointer">
                        <button onClick={() => onVote(comment.id, 'up')} className={`p-1 rounded-full hover:bg-white transition-all ${hasVoted === 'up' ? 'text-green-600' : 'text-black hover:text-green-600'}`}>
                            <ArrowBigUp size={16} className={`stroke-[2.5px] transition-transform ${hasVoted === 'up' ? 'fill-green-600 scale-110' : ''}`} />
                        </button>
                        <span className={`font-bold text-xs min-w-[14px] text-center ${hasVoted === 'up' ? 'text-green-600' : hasVoted === 'down' ? 'text-red-500' : 'text-black'}`}>
                            {score}
                        </span>
                        <button onClick={() => onVote(comment.id, 'down')} className={`p-1 rounded-full hover:bg-white transition-all ${hasVoted === 'down' ? 'text-red-500' : 'text-black hover:text-red-500'}`}>
                            <ArrowBigUp size={16} className={`rotate-180 stroke-[2.5px] transition-transform ${hasVoted === 'down' ? 'fill-red-500 scale-110' : ''}`} />
                        </button>
                    </div>

                    <button onClick={() => setShowReplyInput(!showReplyInput)} className="text-xs text-gray-500 font-bold hover:text-black transition-colors flex items-center gap-1">
                        Reply
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {canDelete && (
                        <button onClick={handleDeleteClick} className="text-xs text-red-400 hover:text-red-600 font-bold flex items-center gap-1">
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>
          </div>
      </div>

      {showReplyInput && (
          <div className="mt-2 ml-4 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <input 
                type="text" 
                value={replyContent} 
                onChange={(e) => setReplyContent(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()} 
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" 
                placeholder={`Reply to ${user.handle}...`} 
                autoFocus
              />
              <button onClick={handleSubmitReply} className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl">Post</button>
          </div>
      )}

      {replyCount > 0 && (
          <div className="mt-2 ml-6">
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-black transition-colors bg-transparent px-3 py-1.5 rounded-lg hover:bg-gray-100 group"
              >
                  {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showReplies ? 'Hide' : `Show ${replyCount}`} Replies
              </button>
          </div>
      )}

      {/* Recursive Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
          <div className="relative border-l-2 border-gray-100 ml-8 pb-2 pl-2">
              {comment.replies.map(reply => (
                  <CommentNode 
                    key={reply.id} 
                    comment={reply} 
                    currentUser={currentUser} 
                    onUserClick={onUserClick} 
                    onReply={onReply} 
                    onDelete={onDelete} 
                    onVote={onVote} 
                    depth={depth + 1}
                  />
              ))}
          </div>
      )}
    </div>

    {showDeleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={(e) => {e.stopPropagation(); setShowDeleteConfirm(false)}}></div>
            <div className={`relative bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-200 ${CARD_SHADOW}`}>
                 <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500"><AlertTriangle size={28} /></div>
                 <h3 className="text-xl font-black text-black mb-2">Delete this comment?</h3>
                 <p className="text-sm text-gray-500 mb-8 font-medium">This action cannot be undone.</p>
                 <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-black font-bold text-sm hover:bg-gray-50 transition-colors">No</button>
                    <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg transition-colors">Yes, Delete</button>
                 </div>
            </div>
        </div>
    )}
    </>
  );
};

const CommentSection = ({ comments = [], currentUser, onUserClick, onReply, onDelete, onVote }) => {
    return (
        <div className="space-y-2 pb-10">
            {comments.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm font-medium">No comments yet. Be the first to start the conversation!</div>
            ) : (
                comments.map((c) => (
                    <CommentNode 
                        key={c.id} 
                        comment={c} 
                        currentUser={currentUser} 
                        onUserClick={onUserClick} 
                        onReply={onReply} 
                        onDelete={onDelete} 
                        onVote={onVote}
                        // depth default = 0
                    />
                ))
            )}
        </div>
    );
};

export default CommentSection;
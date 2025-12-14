import React, { useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, ArrowBigUp } from 'lucide-react';

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

const NotificationsView = ({ notifications, onFollowUser, onNotificationClick, onUserClick, currentUser, onMarkRead }) => {
  
  useEffect(() => {
      return () => {
          if (onMarkRead) onMarkRead();
      };
  }, []);

  const getIcon = (type) => {
    switch (type) {
        case 'follow': return <UserPlus size={16} className="text-black fill-black" />; 
        case 'upvote': return <ArrowBigUp size={18} className="text-black fill-black" />; 
        case 'comment': return <MessageCircle size={16} className="text-black fill-black" />; 
        default: return <Heart size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto py-8 pt-20 md:pt-7 px-4 font-sans animate-in fade-in duration-300">
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100/80 overflow-hidden min-h-[80vh]">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="px-6 py-6 text-center">
                <h1 className="font-black text-xl text-black tracking-tight">Notifications</h1>
            </div>
        </div>

        <div className="divide-y divide-gray-100">
            {notifications.map((notif) => {
                const senderId = notif.sender_id || notif.user?.id;
                const senderName = notif.senderName || notif.user?.name;
                const senderHandle = notif.senderHandle || notif.user?.handle;
                const senderAvatar = notif.senderAvatar || notif.user?.avatar;
                
                const isFollowing = currentUser.followingList ? currentUser.followingList.some(u => u.id === senderId) : false;
                const isComment = notif.type === 'comment';

                return (
                <div 
                    key={notif.id} 
                    onClick={() => onNotificationClick && onNotificationClick(notif)}
                    className={`relative p-5 transition-all duration-300 cursor-pointer group
                        ${!notif.is_read ? 'bg-[#E6F2FF] border-l-4 border-l-[#80A1BA]' : 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent'}
                    `}
                >
                    <div className="flex gap-4 items-start">
                        <div className="flex flex-col items-end gap-1 pt-1 min-w-[24px]">
                            {getIcon(notif.type)}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                    <img 
                                        src={senderAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown"} 
                                        alt={senderName} 
                                        onClick={(e) => { e.stopPropagation(); onUserClick && onUserClick(senderId); }}
                                        className="w-8 h-8 rounded-full border border-gray-100 object-cover mr-2 hover:opacity-80 transition-opacity"
                                    />
                                    {!notif.is_read && (
                                        <span className="bg-[#80A1BA] text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 animate-pulse">NEW</span>
                                    )}
                                </div>
                                
                                {notif.type !== 'follow' && (
                                    <span className="text-xs text-gray-400 font-medium ml-auto">
                                        {formatTimeAgo(notif.created_at)}
                                    </span>
                                )}
                            </div>

                            <div className="pr-2">
                                <p className="text-sm text-black leading-snug">
                                    <span 
                                        onClick={(e) => { e.stopPropagation(); onUserClick && onUserClick(senderId); }}
                                        className="font-bold hover:underline cursor-pointer"
                                    >
                                        {senderHandle}
                                    </span>{' '}
                                    <span className={`text-gray-600 ${!notif.is_read ? 'font-bold text-black' : ''}`}>
                                        {notif.type === 'upvote' ? 'upvoted your post' : notif.type === 'comment' ? 'commented:' : 'started following you'}
                                    </span>
                                </p>

                                {isComment && notif.commentPreview ? (
                                    <div className={`mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50 group-hover:bg-white transition-colors relative`}>
                                        <p className="text-xs text-gray-600 italic line-clamp-2">
                                            "{notif.commentPreview}"
                                        </p>
                                    </div>
                                ) : (
                                    notif.postContent && (
                                        <p className={`mt-2 text-xs font-medium line-clamp-2 border-l-2 pl-3 py-0.5 ${!notif.is_read ? 'text-gray-700 border-gray-400' : 'text-gray-400 border-gray-200'}`}>
                                            "{notif.postContent}"
                                        </p>
                                    )
                                )}
                            </div>
                        </div>

                        {notif.type === 'follow' && (
                            <div className="flex flex-col items-end justify-center pl-2 self-center min-w-[100px] gap-1">
                                <span className="text-xs text-gray-400 font-medium mb-0.5">
                                    {formatTimeAgo(notif.created_at)}
                                </span>

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFollowUser(senderId); 
                                    }}
                                    className={`text-xs font-bold w-full py-2 rounded-xl border transition-all active:scale-95 shadow-sm ${
                                        isFollowing 
                                        ? 'bg-white border-green-200 text-[#00BA7C]' 
                                        : 'bg-black text-white border-transparent hover:bg-gray-800'
                                    }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow Back'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )})}
            {notifications.length === 0 && <div className="text-center py-20"><p className="text-gray-400 text-sm">No notifications yet</p></div>}
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;
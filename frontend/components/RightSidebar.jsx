import React from 'react';
import { MessageCircle, ArrowBigUp } from 'lucide-react';

const RightSidebar = ({ posts = [], onPostClick, onVote, currentUser, onUserClick, trending = [] }) => {
  
  // Ambil 3 Postingan Teratas berdasarkan Upvotes (Hall of Fame)
  const hallOfFame = [...posts]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3);

  return (
    <div className="hidden lg:flex flex-col w-[26rem] p-8 space-y-6 bg-[#FEF8E6] font-sans sticky top-4 h-fit">
      
      {/* HALL OF FAME */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300">
        <h2 className="font-black text-lg mb-8 uppercase tracking-wide text-center text-black">HALL OF FAME</h2>
        <div className="space-y-8">
          {hallOfFame.length === 0 && <p className="text-center text-gray-400 text-xs">Belum ada data bulan ini.</p>}
          
          {hallOfFame.map((post, index) => {
            const user = {
                id: post.userId,
                name: post.name || 'Unknown',
                handle: post.handle || '@unknown',
                avatar: post.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
                badge: post.badge || 'Warga Sipil'
            };

            const rankBg = index === 0 ? 'bg-[#FFE600]' : index === 1 ? 'bg-[#E5E5E5]' : 'bg-[#D97706]';
            const rankText = index === 2 ? 'text-white' : 'text-black';
            
            const isUpvoted = post.userVote === 'up';
            const isDownvoted = post.userVote === 'down';

            return (
              <div key={post.id} className="flex items-start gap-4 relative group cursor-default">
                 <img 
                    src={user.avatar} 
                    alt={user.name} 
                    onClick={() => onUserClick && onUserClick(post.userId)} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                 />
                 
                 <div className="flex-1 pr-10">
                    <div className="mb-1.5">
                        <p 
                            className="font-bold text-sm text-black cursor-pointer hover:underline" 
                            onClick={() => onUserClick && onUserClick(post.userId)}
                        >
                            {user.handle}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">{user.badge}</p>
                    </div>
                    <p 
                        className="text-xs text-black font-medium leading-relaxed mb-3 line-clamp-2 cursor-pointer hover:text-gray-600 transition-colors" 
                        onClick={() => onPostClick(post.id)}
                    >
                      {post.content}
                    </p>
                    
                    {/* Action Buttons Kecil */}
                    <div className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2.5 py-1 shadow-sm">
                           <button onClick={(e) => { e.stopPropagation(); onVote(post.id, 'up'); }} className={`transition-colors ${isUpvoted ? 'text-green-600' : 'text-black hover:text-green-600'}`}>
                                <ArrowBigUp size={16} className={`stroke-2 ${isUpvoted ? 'fill-green-600' : ''}`} />
                           </button>
                           <span className={`text-xs font-bold ml-1 min-w-[16px] text-center ${isUpvoted ? 'text-green-600' : isDownvoted ? 'text-red-500' : 'text-black'}`}>
                                {post.upvotes}
                           </span>
                           <button onClick={(e) => { e.stopPropagation(); onVote(post.id, 'down'); }} className={`transition-colors ${isDownvoted ? 'text-red-500' : 'text-black hover:text-red-500'}`}>
                                <ArrowBigUp size={16} className={`rotate-180 stroke-2 ml-1 ${isDownvoted ? 'fill-red-500' : ''}`} />
                           </button>
                        </div>
                        <div onClick={() => onPostClick(post.id)} className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm cursor-pointer hover:bg-gray-50">
                            <span className="text-xs font-bold mr-1">{post.commentCount}</span>
                            <MessageCircle size={14} className="scale-x-[-1] stroke-2" />
                        </div>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div className={`absolute right-0 top-1 w-9 h-9 ${rankBg} ${rankText} rounded-full flex items-center justify-center font-bold text-lg shadow-sm transform group-hover:scale-110 transition-transform duration-300`}>
                    {index + 1}
                  </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MONTHLY TRENDING TOPICS (CLEANEST VERSION - NO ICON) */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300">
        <h2 className="font-black text-lg mb-8 text-black">Monthly Trending Topics</h2>
        
        <div className="space-y-6">
          {trending.length > 0 ? (
              trending.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                  <div>
                    <p className="font-bold text-sm text-black mb-1 group-hover:text-[#80A1BA] transition-colors">{topic.category}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {topic.postCount} Post - {topic.totalUpvotes} Total Upvote
                    </p>
                  </div>
                </div>
              ))
          ) : (
              <div className="text-center py-4">
                  <p className="text-gray-400 text-sm font-medium">Belum ada topik panas bulan ini 🥶</p>
              </div>
          )}
        </div>

        <div className="mt-12 text-center"><p className="text-[10px] text-gray-400 tracking-wide">-People Always Change Right?-</p></div>
      </div>
    </div>
  );
};

export default RightSidebar;
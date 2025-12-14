import React, { useState, useEffect } from 'react';
import { Search, X, Clock, Ban } from 'lucide-react'; 
import IdeaCard from '../components/IdeaCard'; // Import dari folder sibling
import { INPUT_SHADOW } from '../components/Shadows'; // Import dari folder sibling

const SearchView = ({ posts, allUsers = [], onPostClick, onVote, onDelete, onUserClick, currentUser, onFollowUser }) => {
  const [activeTab, setActiveTab] = useState('People');
  const [query, setQuery] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);

  const [recentSearches, setRecentSearches] = useState(() => {
      const storageKey = `search_history_${currentUser.id}`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
      const storageKey = `search_history_${currentUser.id}`;
      localStorage.setItem(storageKey, JSON.stringify(recentSearches));
  }, [recentSearches, currentUser.id]);

  const usersList = allUsers.filter(u => u.id !== currentUser.id);

  const filteredUsers = query
    ? usersList.filter((u) =>
        (u.handle && u.handle.toLowerCase().includes(query.toLowerCase())) ||
        (u.name && u.name.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const filteredPosts = posts.filter(
    (post) =>
      post.content && post.content.toLowerCase().includes(query.toLowerCase())
  );

  const topPosts = [...filteredPosts].sort((a, b) => b.upvotes - a.upvotes);
  const latestPosts = [...filteredPosts].sort((a, b) => b.id - a.id);

  const handleClearRecent = (item) => {
    if (item) {
      setRecentSearches((prev) => prev.filter((x) => x !== item));
    } else {
      setRecentSearches([]);
    }
  };

  const addToRecent = (text) => {
    if (!text.trim()) return;
    setRecentSearches((prev) => {
      let updated = prev.filter((x) => x.toLowerCase() !== text.toLowerCase());
      updated.unshift(text);
      if (updated.length > 5) updated = updated.slice(0, 5);
      return updated;
    });
  };

  // URL Gambar Panci (Fallback untuk tampilan banned)
  const PANCI_AVATAR = "https://hbbznyruolegfpeyqiru.supabase.co/storage/v1/object/public/images/avatars/banned.png";

  return (
    <div className="relative flex-1 w-full max-w-3xl mx-auto py-8 pt-20 md:pt-7 px-4 font-sans">

      <div className="flex gap-4 mb-6 relative z-10">
        {['Top', 'Latest', 'People'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-[#80A1BA] text-white shadow-md shadow-blue-200/50'
                : 'bg-white text-gray-800 hover:shadow-sm hover:bg-blue-50/50'
            } ${INPUT_SHADOW}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative z-[60] mb-6">
          <div
            className={`bg-white p-5 flex items-center gap-3 border border-gray-100/50 transition-all ${
                showOverlay 
                ? 'rounded-t-[2rem] rounded-b-none shadow-lg' 
                : 'rounded-[2rem] shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-center pointer-events-none pl-2">
              <Search className="text-black" size={20} />
            </div>

            <input
              type="text"
              value={query}
              onFocus={() => setShowOverlay(true)}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addToRecent(query);
                  setShowOverlay(false);
                }
              }}
              className={`w-full bg-gray-100 text-black text-sm rounded-2xl py-3.5 px-4 ${INPUT_SHADOW}`}
              placeholder="Search"
            />
          </div>

          {showOverlay && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-b-[2rem] p-6 pt-2 shadow-lg border border-t-0 border-gray-100/50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-xs font-bold text-gray-500 uppercase">Recent</h3>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={() => handleClearRecent()}
                      className="text-xs font-medium text-gray-500 hover:text-red-500"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((item, idx) => (
                        <div
                        key={idx}
                        onClick={() => {
                            setQuery(item);
                            addToRecent(item);
                            setShowOverlay(false);  
                        }}
                        className="flex justify-between items-center py-2.5 px-3 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                        >
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-gray-400" />
                            <span className="font-semibold text-sm text-gray-700">{item}</span>
                        </div>
                        <button
                            onClick={(e) => {
                            e.stopPropagation();
                            handleClearRecent(item);
                            }}
                            className="text-gray-400 hover:text-black p-1"
                        >
                            <X size={16} />
                        </button>
                        </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-gray-400 italic">No recent searches...</div>
                  )}
                </div>
            </div>
          )}
      </div>

      {showOverlay && (
        <div 
            className="fixed inset-0 z-[50] bg-black/20 backdrop-blur-[1px] transition-opacity"
            onClick={() => setShowOverlay(false)}
        ></div>
      )}

      <div className="space-y-4">
        
        {activeTab === 'People' &&
          (query.length === 0 ? (
            <div className="text-center py-12 text-gray-300 text-sm italic">
              Type something to search people...
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isFollowing = currentUser.followingList ? currentUser.followingList.some(f => f.id === user.id) : false;
              
              const isBanned = user.is_banned === 1;
              const avatarSrc = isBanned ? PANCI_AVATAR : (user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest");

              return (
              <div
                key={user.id}
                className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div 
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => onUserClick && onUserClick(user.id)}
                >
                  <img
                    src={avatarSrc} 
                    className={`w-12 h-12 rounded-full border-2 object-cover ${isBanned ? 'border-red-200 p-1 bg-red-50' : 'border-gray-100'}`}
                    alt=""
                  />
                  <div>
                    <h3 className="font-bold text-sm text-black hover:underline">{user.handle}</h3>
                    <p className="text-xs text-gray-400">{user.badge || 'User'}</p>
                  </div>
                </div>

                {isBanned ? (
                   <span className="px-3 py-1 bg-red-50 border border-red-100 text-red-500 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Ban size={10} /> Banned
                   </span>
                ) : (
                    <button 
                    onClick={() => onFollowUser(user.id)}
                    className={`text-xs font-bold px-8 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 border ${
                        isFollowing
                        ? 'bg-white border-green-200 text-[#00BA7C]' 
                        : 'bg-white border-gray-200 text-black hover:bg-gray-50'
                    }`}
                    >
                    {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}

              </div>
            )})
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              No results found for "{query}"
            </div>
          ))}

        {activeTab === 'Top' && (
          topPosts.length > 0 ? (
            topPosts.map((post) => (
                <IdeaCard 
                    key={post.id} 
                    post={post} 
                    onClick={() => onPostClick(post.id)} 
                    onVote={onVote}
                    onDelete={onDelete}
                    currentUser={currentUser}
                    onUserClick={onUserClick}
                />
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              No results found for "{query}"
            </div>
          )
        )}

        {activeTab === 'Latest' && (
          latestPosts.length > 0 ? (
            latestPosts.map((post) => (
                <IdeaCard 
                    key={post.id} 
                    post={post} 
                    onClick={() => onPostClick(post.id)} 
                    onVote={onVote}
                    onDelete={onDelete}
                    currentUser={currentUser}
                    onUserClick={onUserClick}
                />
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              No results found for "{query}"
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default SearchView;
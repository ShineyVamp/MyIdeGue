import React, { useState } from 'react';
import { PenLine, ArrowLeft } from 'lucide-react'; 
// --- CHANGE: Arahkan ke folder components ---
import IdeaCard from '../components/IdeaCard';
import EditProfileModal from '../components/EditProfileModal';
import FollowListModal from '../components/FollowListModal';

const YourPostView = ({ posts, currentUser, onUpdateProfile, onPostClick, onDelete, onRemoveFollower, onUnfollow, onUserClick, onBack, onVote }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followModal, setFollowModal] = useState({ isOpen: false, type: '', users: [] });

  const userPosts = posts.filter(post => post.userId === currentUser.id);
  const totalUpvotes = Number(userPosts.reduce((acc, curr) => acc + (parseInt(curr.upvotes) || 0), 0));

  const openFollowers = () => {
      setFollowModal({ isOpen: true, type: 'followers', title: 'Followers', users: currentUser.followersList || [] });
  };

  const openFollowing = () => {
      setFollowModal({ isOpen: true, type: 'following', title: 'Following', users: currentUser.followingList || [] });
  };

  const handleModalAction = (userId) => {
      if (followModal.type === 'followers') {
          onRemoveFollower(userId);
      } else if (followModal.type === 'following') {
          onUnfollow(userId);
      }
      setFollowModal(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
  };

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-4 py-8 pt-20 md:pt-7 px-4 font-sans animate-in fade-in duration-300">
      
      {/* HEADER TOMBOL BACK */}
      <div className="flex items-center gap-4 mb-6">
        <button 
            onClick={onBack} 
            className="p-2 hover:bg-gray-200 bg-white rounded-full transition-colors shadow-sm"
        >
            <ArrowLeft size={24} className="text-black" />
        </button>
        <h2 className="text-xl font-bold text-black hidden md:block">Back</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        <div className="w-full lg:w-[22rem] space-y-4 flex-shrink-0">
          <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center relative shadow-sm border border-gray-100/50">
            <button onClick={() => setIsEditModalOpen(true)} className="absolute top-6 right-6 p-2 text-black hover:bg-gray-50 rounded-full transition-colors active:scale-95"><PenLine size={20} /></button>
            <div className="relative mb-4">
                <img 
                    src={currentUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} 
                    alt="Profile" 
                    className="w-28 h-28 rounded-full object-cover border-4 border-gray-100" 
                />
            </div>
            <h2 className="text-xl font-bold text-black mb-1">{currentUser.handle}</h2>
            <p className="text-sm text-gray-400 font-medium mb-6">{currentUser.badge || 'Warga Sipil'}</p>

            <div className="flex w-full justify-between px-4 pt-4 border-t border-gray-100">
                <div className="text-center cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors flex-1" onClick={openFollowers}>
                    <span className="block font-bold text-lg text-black">{currentUser.followersList?.length || 0}</span>
                    <span className="text-xs text-gray-400 font-medium">Followers</span>
                </div>
                <div className="w-[1px] bg-gray-200"></div>
                <div className="text-center cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors flex-1" onClick={openFollowing}>
                    <span className="block font-bold text-lg text-black">{currentUser.followingList?.length || 0}</span>
                    <span className="text-xs text-gray-400 font-medium">Following</span>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">
            <h3 className="text-center font-bold text-lg mb-8 text-black">Monthly Dashboard</h3>
            <div className="space-y-6 px-1">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-black">Total Upvote</span>
                    <span className="text-sm font-bold text-black">{totalUpvotes}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-black">Post</span>
                    <span className="text-sm font-bold text-black">{userPosts.length}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
            <div className="bg-white rounded-[1.5rem] py-3.5 px-8 mb-4 shadow-sm border border-gray-100/50 text-center"><h2 className="font-black text-sm uppercase tracking-widest text-black">YOUR POST</h2></div>
            <div className="space-y-6 pb-20">
                {userPosts.map(post => (
                    <IdeaCard 
                        key={post.id} post={post} currentUser={currentUser} 
                        onClick={() => onPostClick(post.id)} onDelete={onDelete} 
                        onUserClick={onUserClick}
                        onVote={onVote} 
                    />
                ))}
                {userPosts.length === 0 && <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200"><p className="text-gray-400 text-sm font-medium">You haven't posted anything yet!</p></div>}
            </div>
        </div>
      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} currentUser={currentUser} onSave={onUpdateProfile} />
      
      <FollowListModal 
        isOpen={followModal.isOpen}
        onClose={() => setFollowModal({...followModal, isOpen: false})}
        title={followModal.title}
        users={followModal.users}
        listType={followModal.type} 
        onAction={handleModalAction}
        onUserClick={onUserClick}
      />
    </div>
  );
};

export default YourPostView;
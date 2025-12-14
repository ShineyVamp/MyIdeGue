import React, { useState, useEffect } from 'react';
import { UserPlus, Check, ArrowLeft, Ban, ShieldAlert, Unlock, AlertTriangle, CheckCircle } from 'lucide-react';
import IdeaCard from '../components/IdeaCard';
import FollowListModal from '../components/FollowListModal';
import { CARD_SHADOW } from '../components/Shadows';
import { API_URL } from '../config/api';

const OtherUserProfileView = ({ viewingUser, posts, currentUser, onFollowToggle, onPostClick, onVote, onBack, onUserClick, onRefreshData }) => {
  
  // Logic Cek Follow
  const isFollowing = currentUser.followingList ? currentUser.followingList.some(u => u.id === viewingUser.id) : false;
  
  // State Data
  const [userDetail, setUserDetail] = useState(viewingUser);
  const [realFollowers, setRealFollowers] = useState([]);
  const [realFollowing, setRealFollowing] = useState([]);
  
  // State Modals
  const [followModal, setFollowModal] = useState({ isOpen: false, title: '', users: [] });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', title: '', desc: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', desc: '' });

  const userPosts = posts.filter(post => post.userId === viewingUser.id);
  const totalUpvotes = Number(userPosts.reduce((acc, curr) => acc + (parseInt(curr.upvotes) || 0), 0));

  const isAdmin = currentUser?.role === 'admin';
  const isBanned = userDetail.is_banned === 1; 
  
  const PANCI_AVATAR = "https://hbbznyruolegfpeyqiru.supabase.co/storage/v1/object/public/images/avatars/banned.png"; 

  // --- FETCH DATA ---
  const fetchUserData = async () => {
      try {
          const resDetail = await fetch(`${API_URL}/users/${viewingUser.id}`);
          if (resDetail.ok) {
              const dataDetail = await resDetail.json();
              setUserDetail(dataDetail);

              // Hanya fetch followers jika TIDAK BANNED
              if (dataDetail.is_banned !== 1) {
                const resFollowers = await fetch(`${API_URL}/users/${viewingUser.id}/followers`);
                setRealFollowers(await resFollowers.json());

                const resFollowing = await fetch(`${API_URL}/users/${viewingUser.id}/following`);
                setRealFollowing(await resFollowing.json());
              }
          }
      } catch (err) { console.error(err); }
  };

  useEffect(() => {
      fetchUserData();
  }, [viewingUser.id, isFollowing]);

  // --- HANDLERS ADMIN ---
  
  const triggerBanConfirm = () => {
      setConfirmModal({
          isOpen: true,
          type: 'ban',
          title: `Ban ${userDetail.handle}?`,
          desc: "User will be restricted and all their content will be deleted permanently.",
          btnColor: 'bg-red-600',
          btnText: 'Yes, Ban User'
      });
  };

  const triggerUnbanConfirm = () => {
      setConfirmModal({
          isOpen: true,
          type: 'unban',
          title: `Unban ${userDetail.handle}?`,
          desc: "User access will be restored. Previous deleted content cannot be recovered.",
          btnColor: 'bg-green-600',
          btnText: 'Yes, Unban User'
      });
  };

  const executeAdminAction = async () => {
      const token = localStorage.getItem('token');
      const action = confirmModal.type; 
      
      try {
          const res = await fetch(`${API_URL}/users/${userDetail.id}/${action}`, {
              method: 'POST',
              headers: { 'Authorization': token }
          });

          if (res.ok) {
              setConfirmModal({ ...confirmModal, isOpen: false });
              setSuccessModal({
                  isOpen: true,
                  title: action === 'ban' ? 'User Banned' : 'User Unbanned',
                  desc: action === 'ban' ? 'User has been successfully restricted.' : 'User access has been restored.'
              });
              
              // Refresh data lokal di view ini
              fetchUserData(); 

              // PENTING: Refresh data Global di App.jsx agar pencarian update
              if (onRefreshData) onRefreshData(); 
          }
      } catch (err) { console.error(err); }
  };

  const openFollowList = (type) => {
      setFollowModal({ isOpen: true, title: type, users: type === 'Followers' ? realFollowers : realFollowing });
  };

  const displayName = userDetail.name || userDetail.handle || "User";

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-4 py-8 pt-20 md:pt-7 px-4 font-sans animate-in fade-in duration-300">
      
      {/* HEADER BACK */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 bg-white rounded-full transition-colors shadow-sm"><ArrowLeft size={24} className="text-black" /></button>
        <h2 className="text-xl font-bold text-black hidden md:block">Back</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR PROFILE */}
        <div className="w-full lg:w-[22rem] space-y-4 flex-shrink-0">
          <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center relative shadow-sm border border-gray-100/50">
            
            {/* AVATAR */}
            <div className="relative mb-4">
                <img 
                    src={isBanned ? PANCI_AVATAR : (userDetail.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest")} 
                    alt="Profile" 
                    className={`w-28 h-28 rounded-full object-cover border-4 ${isBanned ? 'border-red-500 p-2 bg-red-50' : 'border-gray-100'}`} 
                />
            </div>

            {/* NAMA & LABEL BANNED */}
            <div className="text-center mb-1 flex flex-col items-center">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                    {userDetail.handle}
                </h2>
                {isBanned && (
                    <span className="mt-1 px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider shadow-sm animate-pulse">
                        BANNED
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-400 font-medium mb-6">{userDetail.badge || 'Warga Sipil'}</p>

            {/* AREA TOMBOL */}
            <div className="w-full space-y-3">
                {isBanned ? (
                    // --- TAMPILAN JIKA BANNED ---
                    <>
                        <div className="w-full py-4 bg-red-50 text-red-500 text-xs font-bold text-center rounded-xl flex flex-col items-center justify-center gap-2 border border-red-100">
                            <Ban size={24}/> 
                            <span>Account Suspended</span>
                        </div>
                        
                        {/* TOMBOL UNBAN (Khusus Admin) */}
                        {isAdmin && (
                            <button 
                                onClick={triggerUnbanConfirm} 
                                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white"
                            >
                                <Unlock size={18} /> Unban User
                            </button>
                        )}
                    </>
                ) : (
                    // --- TAMPILAN NORMAL (BELUM BANNED) ---
                    <>
                        <button onClick={() => onFollowToggle(userDetail.id)} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${isFollowing ? 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50' : 'bg-black text-white hover:bg-gray-800 border-2 border-transparent'}`}>
                            {isFollowing ? <><Check size={18} /> Followed</> : <><UserPlus size={18} /> Follow</>}
                        </button>

                        {/* TOMBOL BAN (Khusus Admin) */}
                        {isAdmin && (
                            <button 
                                onClick={triggerBanConfirm} 
                                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white"
                            >
                                <Ban size={18} /> Ban User
                            </button>
                        )}

                        <div className="flex w-full justify-between px-4 pt-4 border-t border-gray-100 mt-4">
                            <div className="text-center cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors flex-1" onClick={() => openFollowList('Followers')}>
                                <span className="block font-bold text-lg text-black">{userDetail.followersCount || 0}</span>
                                <span className="text-xs text-gray-400 font-medium">Followers</span>
                            </div>
                            <div className="w-[1px] bg-gray-200"></div>
                            <div className="text-center cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors flex-1" onClick={() => openFollowList('Following')}>
                                <span className="block font-bold text-lg text-black">{userDetail.followingCount || 0}</span>
                                <span className="text-xs text-gray-400 font-medium">Following</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
          </div>

          {/* MONTHLY DASHBOARD (HANYA MUNCUL JIKA TIDAK BANNED) */}
          {!isBanned && (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">
                <h3 className="text-center font-bold text-lg mb-8 text-black">Monthly Dashboard</h3>
                <div className="space-y-6 px-1">
                    <div className="flex justify-between items-center"><span className="text-sm font-medium text-black">Total Upvote</span><span className="text-sm font-bold text-black">{totalUpvotes}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm font-medium text-black">Post</span><span className="text-sm font-bold text-black">{userPosts.length}</span></div>
                </div>
            </div>
          )}
        </div>

        {/* FEED POSTS */}
        <div className="flex-1 min-w-0">
            <div className="bg-white rounded-[1.5rem] py-3.5 px-8 mb-4 shadow-sm border border-gray-100/50 text-center">
                <h2 className="font-black text-sm uppercase tracking-widest text-black">
                    {isBanned ? 'CONTENT REMOVED' : `${displayName}'S POSTS`}
                </h2>
            </div>
            
            <div className="space-y-6 pb-20">
                {isBanned ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-red-200 flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-sm">
                            <img src={PANCI_AVATAR} alt="Banned" className="w-12 h-12 opacity-50" />
                        </div>
                        <h3 className="text-lg font-black text-gray-800 mb-1">User Banned</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                            This account has been suspended for violating rules.
                        </p>
                    </div>
                ) : (
                    <>
                        {userPosts.map(post => (
                            <IdeaCard 
                                key={post.id} post={post} 
                                currentUser={currentUser}
                                onClick={() => onPostClick(post.id)}
                                onVote={onVote}
                                onUserClick={onUserClick}
                            />
                        ))}
                        {userPosts.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm font-medium">Hasn't posted anything yet.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>

      <FollowListModal isOpen={followModal.isOpen} onClose={() => setFollowModal({...followModal, isOpen: false})} title={followModal.title} users={followModal.users} onUserClick={onUserClick} />

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmModal({...confirmModal, isOpen: false})}></div>
            <div className={`relative bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-200 ${CARD_SHADOW}`}>
                 <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${confirmModal.type === 'ban' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {confirmModal.type === 'ban' ? <AlertTriangle size={28} /> : <Unlock size={28} />}
                 </div>
                 <h3 className="text-xl font-black text-black mb-2">{confirmModal.title}</h3>
                 <p className="text-sm text-gray-500 mb-8 font-medium">{confirmModal.desc}</p>
                 <div className="flex gap-3">
                    <button onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className="flex-1 py-3 rounded-xl border border-gray-200 text-black font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={executeAdminAction} className={`flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-colors ${confirmModal.btnColor}`}>
                        {confirmModal.btnText}
                    </button>
                 </div>
            </div>
        </div>
      )}

      {/* --- SUCCESS MODAL --- */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div className={`relative bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-200 ${CARD_SHADOW}`}>
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-green-600">
                    <CheckCircle size={32} />
                 </div>
                 <h3 className="text-xl font-black text-black mb-2">{successModal.title}</h3>
                 <p className="text-sm text-gray-500 mb-8 font-medium">{successModal.desc}</p>
                 <button onClick={() => setSuccessModal({...successModal, isOpen: false})} className="w-full py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors">
                    Close
                 </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default OtherUserProfileView;
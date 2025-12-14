import React, { useState, useEffect } from 'react';

// --- KOMPONEN UI (Tetap di folder components) ---
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import IdeaCard from './components/IdeaCard';
import CreateIdea from './components/CreateIdea';
import CreatePostModal from './components/CreatePostModal';
import { INPUT_SHADOW } from './components/Shadows';

// --- HALAMAN UTAMA (Sekarang ambil dari folder PAGES) ---
import Auth from './pages/Auth';
import SearchView from './pages/SearchView';
import NotificationsView from './pages/NotificationsView';
import PostDetail from './pages/PostDetail';
import SettingsView from './pages/SettingsView';
import YourPostView from './pages/YourPostView';
import OtherUserProfileView from './pages/OtherUserProfileView';
import AdminReportView from './pages/AdminReportView'; 

// --- UTILS & CONFIG ---
import { CATEGORIES } from './constants';
import { ViewState } from './types';
import { Menu, X, ArrowUpDown } from 'lucide-react'; 
import { API_URL } from './config/api';

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

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
  });

  const [viewState, setViewState] = useState(() => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('currentUser');
      return (token && savedUser) ? 'HOME' : ViewState.LOGIN;
  });

  // --- STATE UTAMA ---
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest'); 
  const [adminReportCount, setAdminReportCount] = useState(0); 
  
  // --- NAVIGATION STATE ---
  const [viewingUser, setViewingUser] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  
  const [posts, setPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const unreadNotificationCount = notifications.filter(n => n.is_read === 0).length;

  useEffect(() => {
      if (viewState === 'HOME' && !window.history.state) {
          const initialState = {
              tab: 'home',
              postId: null,
              viewingUser: null,
              category: 'All'
          };
          window.history.replaceState(initialState, '');
      }
  }, [viewState]);

  const applyState = (state) => {
      if (!state) return;
      setActiveTab(state.tab || 'home');
      setSelectedPostId(state.postId || null);
      setViewingUser(state.viewingUser || null);
      if (state.category) setActiveCategory(state.category);
      setMobileMenuOpen(false);
  };

  useEffect(() => {
      const handlePopState = (event) => {
          if (event.state) {
              applyState(event.state);
          } else {
              setActiveTab('home');
              setSelectedPostId(null);
              setViewingUser(null);
          }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newState) => {
      const fullState = {
          tab: newState.tab || activeTab,
          postId: newState.postId !== undefined ? newState.postId : selectedPostId,
          viewingUser: newState.viewingUser !== undefined ? newState.viewingUser : viewingUser,
          category: newState.category || activeCategory
      };

      window.history.pushState(fullState, '');
      applyState(fullState);
  };

  const handleGlobalBack = () => {
      window.history.back();
  };

  const handleGoToPost = (postId) => {
      navigateTo({ postId: postId }); 
  };

  const handleGoToUser = (userId) => {
      if (userId === currentUser.id) {
          navigateTo({ tab: 'profile', viewingUser: null, postId: null });
      } else {
          const targetUser = allUsers.find(u => u.id == userId);
          if (targetUser) {
              navigateTo({ tab: 'other-profile', viewingUser: targetUser, postId: null });
          }
      }
  };

  const handleNotificationClick = (n) => {
      if (n.type === 'follow') {
          const userId = n.sender_id || n.user?.id;
          if (userId) handleGoToUser(userId);
      } else if (n.post_id) {
          navigateTo({ postId: n.post_id });
      }
  };

  const markNotificationsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/notifications/mark-read`, { method: 'PUT', headers: { 'Authorization': token } });
  };

  const handleTabChange = (t) => {
      if (t === activeTab && !selectedPostId) return; 
      
      if (t === 'notification') {
          const token = localStorage.getItem('token');
          fetch(`${API_URL}/notifications`, { headers: { 'Authorization': token } })
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(err => console.error(err));
      }

      navigateTo({ tab: t, postId: null, viewingUser: null });
  };

  const fetchTrending = async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_URL}/posts/trending`, { headers: { 'Authorization': token } });
          if (res.ok) {
              setTrendingData(await res.json());
          }
      } catch (err) { console.error("Error fetching trending:", err); }
  };

  const fetchInitialData = async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const headers = { 'Authorization': token };

          const postRes = await fetch(`${API_URL}/posts`, { headers });
          if (postRes.ok) {
              const postData = await postRes.json();
              const formattedPosts = postData.map(p => ({
                  ...p,
                  id: p.id,
                  userId: p.user_id,
                  timestamp: formatTimeAgo(p.created_at), 
                  images: p.image_url ? [p.image_url] : [],
                  userVote: p.userVote || null, 
                  comments: [] 
              }));
              setPosts(formattedPosts);
          }

          const userRes = await fetch(`${API_URL}/users`, { headers });
          if (userRes.ok) {
              setAllUsers(await userRes.json());
          }

          if (currentUser && currentUser.id) {
              const myFollowersRes = await fetch(`${API_URL}/users/${currentUser.id}/followers`, { headers });
              const myFollowingRes = await fetch(`${API_URL}/users/${currentUser.id}/following`, { headers });
              
              if (myFollowersRes.ok && myFollowingRes.ok) {
                  const followers = await myFollowersRes.json();
                  const following = await myFollowingRes.json();
                  setCurrentUser(prev => ({
                      ...prev,
                      followersList: followers,
                      followingList: following
                  }));
              }
          }

          fetchTrending();
          
          const notifRes = await fetch(`${API_URL}/notifications`, { headers });
          if (notifRes.ok) {
              setNotifications(await notifRes.json());
          }

          if (currentUser && currentUser.role === 'admin') {
              const reportRes = await fetch(`${API_URL}/admin/reports`, { headers });
              if (reportRes.ok) {
                  const reports = await reportRes.json();
                  setAdminReportCount(reports.length); 
              }
          }

      } catch (error) {
          console.error("Error fetching data:", error);
      }
  };

  useEffect(() => {
      if (viewState === 'HOME') {
          fetchInitialData();
      }
  }, [viewState]);

  const handleLoginSuccess = (loginResponse) => {
      const { token, user } = loginResponse;
      const formattedUser = {
          ...user, 
          followersList: [], 
          followingList: [] 
      };
      
      localStorage.setItem('token', token); 
      localStorage.setItem('currentUser', JSON.stringify(formattedUser));
      
      setCurrentUser(formattedUser);
      setViewState('HOME');
      
      setTimeout(() => fetchInitialData(), 100);
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setViewState(ViewState.LOGIN);
      window.history.replaceState(null, '');
  };

  const handleNewPost = async ({ content, category, images }) => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/posts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': token },
              body: JSON.stringify({ content, category, image_url: images[0] || '' })
          });
          if (res.ok) {
              fetchInitialData(); 
              setIsCreateModalOpen(false);
          }
      } catch (err) { console.error(err); }
  };

  const handleDeletePost = async (postId) => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': token } });
          
          if (res.ok) {
              setPosts(prev => prev.filter(p => p.id !== postId));
              if (selectedPostId === postId) handleGlobalBack(); 
              fetchTrending(); 
          } else {
             const data = await res.json();
             alert(data.message || "Failed to delete post");
          }
      } catch (err) { console.error(err); }
  };

  const handleVote = async (postId, type) => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/posts/${postId}/vote`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': token },
              body: JSON.stringify({ type })
          });
          
          if (res.ok) {
              const data = await res.json();
              setPosts(currentPosts => currentPosts.map(post => {
                  if (post.id !== postId) return post;
                  return { ...post, upvotes: data.newUpvotes, userVote: data.userVote };
              }));
              fetchTrending(); 
          }
      } catch (err) { console.error(err); }
  };

  const handleAddReply = async (postId, parentId, content) => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': token },
              body: JSON.stringify({ content, parent_id: parentId })
          });
          
          if (res.ok) {
              if (!parentId) {
                  setPosts(prev => prev.map(p => 
                      p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
                  ));
              }
              return true;
          }
          return false;
      } catch (err) { console.error(err); return false; }
  };

  const handleCommentVote = async (commentId, type) => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/posts/comments/${commentId}/vote`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': token },
              body: JSON.stringify({ type })
          });
          if (res.ok) return true;
      } catch (err) { console.error(err); }
      return false;
  };

  const handleDeleteComment = async (commentId, isRoot) => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/posts/comments/${commentId}`, {
              method: 'DELETE',
              headers: { 'Authorization': token }
          });
          if (res.ok) {
              // Jika komentar yang dihapus adalah komentar utama (isRoot = true), kurangi counter
              if (isRoot && selectedPostId) {
                  setPosts(prev => prev.map(p => 
                      p.id === selectedPostId ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) } : p
                  ));
              }
              return true;
          }
      } catch (err) { console.error(err); }
      return false;
  };

  const handleUpdateProfile = async (updatedData) => {
      const token = localStorage.getItem('token');
      try {
          await fetch(`${API_URL}/users/profile`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': token },
              body: JSON.stringify(updatedData)
          });

          const newUser = { ...currentUser, ...updatedData };
          setCurrentUser(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));

          setPosts(prevPosts => prevPosts.map(post => {
              if (post.userId === currentUser.id) {
                  return {
                      ...post,
                      avatar: updatedData.avatar || post.avatar,
                      handle: updatedData.handle || post.handle,
                      badge: updatedData.badge || post.badge
                  };
              }
              return post;
          }));

      } catch (err) { console.error(err); }
  };

  const handleFollowUser = async (targetUserId) => {
      if (targetUserId === currentUser.id) return;
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/users/${targetUserId}/follow`, {
              method: 'POST',
              headers: { 'Authorization': token }
          });
          fetchInitialData(); 
      } catch (err) { console.error(err); }
  };

  const handleRemoveFollower = async (followerId) => {
      setCurrentUser(prev => ({ ...prev, followersList: prev.followersList.filter(u => u.id !== followerId) }));
      
      const token = localStorage.getItem('token');
      try {
          await fetch(`${API_URL}/users/${followerId}/remove-follower`, {
              method: 'DELETE',
              headers: { 'Authorization': token }
          });
          fetchInitialData();
      } catch (err) {
          console.error("Gagal menghapus follower", err);
      }
  };

  const filteredByCategory = activeCategory === 'All' 
      ? posts 
      : posts.filter(p => p.category === activeCategory);

  const sortedFeedPosts = [...filteredByCategory].sort((a, b) => {
      if (sortBy === 'popular') return b.upvotes - a.upvotes;
      return b.id - a.id; 
  });

  const renderContent = () => {
      if (selectedPostId) {
          const post = posts.find(p => p.id === selectedPostId) || { id: selectedPostId };
          return (
            <main className="flex-1 max-w-8xl w-full px-1 md:px-8 py-9 pt-2 md:pt-8 min-h-screen overflow-y-auto">
                <PostDetail 
                    post={post} 
                    onBack={handleGlobalBack} 
                    onVote={handleVote} 
                    onAddReply={handleAddReply} 
                    onDelete={handleDeletePost} 
                    onCommentVote={handleCommentVote} 
                    onDeleteComment={handleDeleteComment}
                    currentUser={currentUser} 
                    onUserClick={handleGoToUser} 
                />
            </main>
          );
      }

      if (activeTab === 'search') return <SearchView posts={posts} allUsers={allUsers} onPostClick={handleGoToPost} onVote={handleVote} onDelete={handleDeletePost} currentUser={currentUser} onUserClick={handleGoToUser} onFollowUser={handleFollowUser}/>;
      
      if (activeTab === 'notification') return <NotificationsView notifications={notifications} onFollowUser={handleFollowUser} onNotificationClick={handleNotificationClick} onUserClick={handleGoToUser} currentUser={currentUser} onMarkRead={markNotificationsRead} />;
      
      if (activeTab === 'setting') return <SettingsView currentUser={currentUser} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />;
      
      if (activeTab === 'profile') return (
        <YourPostView 
            posts={posts} 
            onPostClick={handleGoToPost} 
            onDelete={handleDeletePost} 
            currentUser={currentUser} 
            onUpdateProfile={handleUpdateProfile} 
            onRemoveFollower={handleRemoveFollower} 
            onUnfollow={handleFollowUser} 
            onUserClick={handleGoToUser}
            onBack={handleGlobalBack}
            onVote={handleVote} 
        />
      );
      
      if (activeTab === 'other-profile' && viewingUser) return (
        <OtherUserProfileView 
            viewingUser={viewingUser} 
            posts={posts} 
            currentUser={currentUser} 
            onFollowToggle={handleFollowUser} 
            onPostClick={handleGoToPost} 
            onVote={handleVote} 
            onBack={handleGlobalBack} 
            onUserClick={handleGoToUser}
            onRefreshData={fetchInitialData} 
        />
      );

      if (activeTab === 'admin-reports' && currentUser?.role === 'admin') {
        return (
          <AdminReportView 
              currentUser={currentUser} 
              onGoToPost={handleGoToPost} 
              onGoToUser={handleGoToUser}
              onRefresh={fetchInitialData} 
          />
        );
    }

      return (
        <main className="flex-1 max-w-6xl w-full px-2 md:px-8 py-8 pt-20 md:pt-7 min-h-screen overflow-y-auto">
            <div className="sticky top-0 z-10 bg-[#FEF8E6]/95 backdrop-blur-sm pb-1 pt-2 -mx-4 px-4 flex justify-between items-center gap-2">
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide flex-1">
                    {CATEGORIES.map((cat) => (
                        <button key={cat} onClick={() => { setActiveCategory(cat); navigateTo({ category: cat }); }} className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#80A1BA] text-white shadow-md shadow-blue-200/50' : 'bg-white text-gray-800 hover:shadow-sm hover:bg-blue-50/50'} ${INPUT_SHADOW}`}>{cat}</button>
                    ))}
                </div>
                <button 
                    onClick={() => setSortBy(prev => prev === 'latest' ? 'popular' : 'latest')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95 mb-2"
                >
                    <ArrowUpDown size={16} className="text-gray-600" />
                    <span className="text-xs font-bold text-gray-700 hidden sm:block">
                        {sortBy === 'latest' ? 'Latest' : 'Popular'}
                    </span>
                </button>
            </div>

            <div className="mt-4"><CreateIdea onTrigger={() => setIsCreateModalOpen(true)} currentUser={currentUser} /></div>
            
            <div className="space-y-4 pb-1">
                {posts.length === 0 && <div className="text-center py-20 text-gray-400"><p>Belum ada postingan. Jadilah yang pertama!</p></div>}
                
                {sortedFeedPosts.map((post) => (
                    <IdeaCard 
                        key={post.id} post={post} 
                        onClick={() => handleGoToPost(post.id)} 
                        onVote={handleVote} onDelete={handleDeletePost} currentUser={currentUser} 
                        onUserClick={handleGoToUser} 
                    />
                ))}
            </div>
        </main>
      );
  };

  if (viewState === ViewState.LOGIN || viewState === ViewState.SIGNUP || viewState === ViewState.FORGOT_PASSWORD) return <Auth view={viewState} setView={setViewState} onLoginSuccess={handleLoginSuccess} />;
  if (!currentUser) return null; 

  return (
    <div className="flex min-h-screen bg-[#FEF8E6] text-text-primary font-sans">
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex justify-between items-center border-b border-gray-100 shadow-sm"><h1 className="text-xl font-black tracking-tighter">MyIde<span className="text-gray-800">Gue</span></h1><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button></div>
        
        {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 bg-white z-40 pt-16 px-6">
                <Sidebar 
                    activeTab={activeTab} 
                    setActiveTab={handleTabChange} 
                    onLogout={handleLogout} 
                    currentUser={currentUser}
                    reportCount={adminReportCount}
                    notificationCount={unreadNotificationCount} 
                />
            </div>
        )}

        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            onLogout={handleLogout} 
            currentUser={currentUser}
            reportCount={adminReportCount}
            notificationCount={unreadNotificationCount} 
        />
        
        <div className="flex-1 flex justify-center bg-[#FEF8E6]">
            <div className="flex w-full max-w-[2000px] mx-auto gap-6 justify-between px-6">
                {renderContent()}
                {activeTab !== 'setting' && activeTab !== 'profile' && activeTab !== 'other-profile' && (
                  <div className="w-[400px] shrink-0">
                    <RightSidebar 
                        posts={filteredByCategory} 
                        onPostClick={handleGoToPost} 
                        onVote={handleVote} 
                        currentUser={currentUser} 
                        onUserClick={handleGoToUser} 
                        trending={trendingData} 
                    />
                  </div>
                )}
            </div>
        </div>
        {isCreateModalOpen && <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onPost={handleNewPost} currentUser={currentUser} />}
    </div>
  );
}

export default App;
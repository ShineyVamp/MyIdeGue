import { useRef, useState } from "react";
import { Home, Search, Bell, Settings, MoreVertical, LogOut, HelpCircle, ShieldAlert  } from 'lucide-react';
import { INPUT_SHADOW, CARD_SHADOW } from './Shadows';

// Tambahkan prop 'notificationCount'
const Sidebar = ({ activeTab, setActiveTab, onLogout, currentUser, reportCount = 0, notificationCount = 0 }) => {

  const menuRef = useRef(null);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'notification', label: 'Notification', icon: Bell },
    { id: 'setting', label: 'Setting', icon: Settings },
  ];

  return (
    <>
    <aside className={`hidden md:flex flex-col w-65 h-screen sticky top-0 p-8 justify-between bg-[#FAFAFA] z-40 border-r border-gray-100 flex-shrink-0 font-sans rounded-tr-[15px] ${INPUT_SHADOW}`}>
      {/* =============== LOGO =============== */}
      <div className="pl-1 select-none cursor-pointer mb-20" onClick={() => setActiveTab('home')}>
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-1 hover:opacity-90 transition-opacity">
          <span className="text-black">Myide</span>
          <span
            className="text-white"
            style={{
              WebkitTextStroke: '4px black',
              paintOrder: 'stroke fill'
            }}
          >
            Gue
          </span>
        </h1>
      </div>

      {/* =============== NAVIGATION =============== */}
      <nav className="space-y-6">
        {navItems.map((item) => {
          // Cek apakah item ini adalah notification dan ada badge?
          const isNotifItem = item.id === 'notification';
          const showBadge = isNotifItem && notificationCount > 0;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-5 w-full p-3 rounded-xl transition-all duration-200 group relative
                ${
                  isActive
                    ? 'text-black font-bold bg-gray-50'
                    : 'text-gray-600 font-medium hover:bg-gray-50/50 hover:text-black'
                }`}
            >
              {/* ICON WRAPPER (Untuk Titik Merah) */}
              <div className="relative">
                 <item.icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-black' : ''}`}
                 />
                 {/* Titik Merah Kecil di Icon */}
                 {showBadge && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></div>
                 )}
              </div>

              {/* LABEL */}
              <span className={`text-lg tracking-wide flex-1 text-left ${showBadge ? 'font-bold text-black' : ''}`}>
                  {item.label}
              </span>

              {/* BADGE ANGKA (Sebelah Kanan) */}
              {showBadge && (
                  <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-in zoom-in">
                      {notificationCount > 99 ? '99+' : notificationCount}
                  </div>
              )}
            </button>
          );
        })}

        {/* MENU KHUSUS ADMIN (REPORTS) */}
        {currentUser && currentUser.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin-reports')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                 activeTab === 'admin-reports' 
                    ? 'bg-red-50 text-red-600 shadow-sm border border-red-100 font-bold' 
                    : 'text-gray-500 hover:bg-red-50 hover:text-red-500 font-medium'
               }`}
            >
              <div className="relative">
                  <ShieldAlert 
                      size={24} 
                      strokeWidth={activeTab === 'admin-reports' ? 2.5 : 2}
                      className={`transition-colors ${reportCount > 0 ? 'text-red-500' : ''}`}
                  />
                  {/* RED DOT NOTIFICATION */}
                  {reportCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full animate-pulse"></div>
                  )}
              </div>

              <span className={`text-base tracking-wide flex-1 text-left ${reportCount > 0 ? 'text-red-600 font-bold' : ''}`}>
                  Reports
              </span>
              
              {/* BADGE ANGKA */}
              {reportCount > 0 && (
                  <div className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {reportCount}
                  </div>
              )}
            </button>
        )}
      </nav>

      {/* =============== PROFILE =============== */}
      <div
        className={`relative flex items-center justify-between mt-auto cursor-pointer group p-2.5 rounded-2xl transition-all duration-200 -ml-2 -mr-2 border border-transparent hover:border-gray-100
          ${activeTab === 'profile' ? 'bg-gray-50 border-gray-100' : 'hover:bg-gray-50'}`}
        onClick={() => setActiveTab('profile')}
        ref={menuRef}
      >

        <div className="flex items-center space-x-3">
          <img
            src={currentUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} 
            alt="Profile"
            className="w-11 h-11 rounded-full border border-gray-200 object-cover group-hover:border-white transition-colors"
          />
          <div className="text-left">
            <p className="text-xs font-bold text-black mb-0.5 group-hover:text-gray-900">
              {currentUser.handle} 
            </p>
            <p className="text-[10px] text-gray-400 font-medium group-hover:text-gray-500">
              {currentUser.badge} 
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowLogoutMenu(!showLogoutMenu);
          }}
          className="p-2 text-black-300 hover:text-black hover:bg-gray-200 rounded-full transition-colors"
        >
          <MoreVertical size={20} />
        </button>

        {showLogoutMenu && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  setShowLogoutMenu(false);
                  setShowLogoutConfirm(true); 
              }}
              className="w-full text-left px-4 py-3 text-red-500 font-bold hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>

    {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
            <div className={`relative bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-200 ${CARD_SHADOW}`}>
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-600">
                    <HelpCircle size={28} />
                </div>
                <h3 className="text-xl font-black text-black mb-2">Are you sure?</h3>
                <p className="text-sm text-gray-500 mb-8 font-medium">
                    Do you really want to log out from your account?
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-black font-bold text-sm hover:bg-gray-50 transition-colors">No</button>
                    <button onClick={() => { setShowLogoutConfirm(false); onLogout(); }} className="flex-1 py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 shadow-lg transition-colors">Yes</button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Sidebar;

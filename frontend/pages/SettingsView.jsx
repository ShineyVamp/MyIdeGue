import React, { useState } from 'react';
import { Mail, Lock, AlertTriangle, CheckCircle, Trash2, ShieldAlert, Save, KeyRound } from 'lucide-react';
import { CARD_SHADOW, INPUT_SHADOW } from '../components/Shadows';
import { API_URL } from '../config/api';

const SettingsView = ({ currentUser, onUpdateProfile, onLogout }) => {
  // State Form
  const [email, setEmail] = useState(currentUser?.email || '');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  // State Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'email', 'password', 'delete'
  const [statusMsg, setStatusMsg] = useState({ type: '', msg: '' });

  // --- HANDLERS ---
  const handleEmailChange = async () => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/users/change-email`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': token },
              body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (res.ok) {
              onUpdateProfile({ email }); 
              setStatusMsg({ type: 'success', msg: 'Email successfully updated!' });
          } else {
              setStatusMsg({ type: 'error', msg: data.message });
          }
      } catch (err) { setStatusMsg({ type: 'error', msg: 'Server Error' }); }
      setModalOpen(false);
  };

  const handlePasswordChange = async () => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/users/change-password`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': token },
              body: JSON.stringify({ 
                  currentPassword: passwords.current, 
                  newPassword: passwords.new 
              })
          });
          const data = await res.json();
          if (res.ok) {
              setPasswords({ current: '', new: '', confirm: '' });
              setStatusMsg({ type: 'success', msg: 'Password changed successfully!' });
          } else {
              setStatusMsg({ type: 'error', msg: data.message });
          }
      } catch (err) { setStatusMsg({ type: 'error', msg: 'Server Error' }); }
      setModalOpen(false);
  };

  const handleDeleteAccount = async () => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/users/delete-account`, {
              method: 'DELETE',
              headers: { 'Authorization': token }
          });
          if (res.ok) {
              onLogout(); 
          }
      } catch (err) { console.error(err); }
  };

  const triggerConfirmation = (type) => {
      if (type === 'password') {
          if (passwords.new !== passwords.confirm) {
              setStatusMsg({ type: 'error', msg: "New passwords do not match!" });
              return;
          }
          if (!passwords.current || !passwords.new) return;
      }
      setModalType(type);
      setModalOpen(true);
      setStatusMsg({ type: '', msg: '' }); 
  };

  // --- MODAL CONTENT ---
  const getModalContent = () => {
      switch (modalType) {
          case 'email':
              return {
                  icon: <Mail size={28} />,
                  color: 'bg-blue-100 text-blue-600',
                  title: 'Change Email?',
                  desc: `Are you sure you want to change your email to "${email}"?`,
                  action: handleEmailChange,
                  btnText: 'Yes, Change',
                  btnColor: 'bg-blue-600 hover:bg-blue-700'
              };
          case 'password':
              return {
                  icon: <Lock size={28} />,
                  color: 'bg-yellow-100 text-yellow-600',
                  title: 'Change Password?',
                  desc: 'You will need to login again with your new password on other devices.',
                  action: handlePasswordChange,
                  btnText: 'Update Password',
                  btnColor: 'bg-black hover:bg-gray-800'
              };
          case 'delete':
              return {
                  icon: <AlertTriangle size={28} />,
                  color: 'bg-red-100 text-red-600',
                  title: 'Delete Account?',
                  desc: 'WARNING: This will permanently delete your account, posts, comments, and all data. This action cannot be undone.',
                  action: handleDeleteAccount,
                  btnText: 'Yes, Delete Everything',
                  btnColor: 'bg-red-600 hover:bg-red-700'
              };
          default: return {};
      }
  };

  const modalData = getModalContent();

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto py-8 pt-20 md:pt-7 px-4 font-sans animate-in fade-in duration-300">
      
      {/* STATUS MESSAGE */}
      {statusMsg.msg && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm animate-in slide-in-from-top-2 ${statusMsg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
            {statusMsg.type === 'success' ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
            {statusMsg.msg}
        </div>
      )}

      {/* 1. MAIN SETTINGS CARD */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100/50 p-8 mb-8">
          
          <div className="mb-8">
            <h1 className="font-black text-2xl text-black mb-1">Account Settings</h1>
            <p className="text-gray-400 text-sm">Update your email and security preferences.</p>
          </div>

          {/* A. EMAIL SECTION */}
          <div className="mb-10">
              <label className="text-xs font-bold text-gray-400 ml-1 mb-2 block uppercase tracking-wider">Email Address</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-100 text-black ${INPUT_SHADOW}`}
                    />
                </div>
                <button 
                    onClick={() => triggerConfirmation('email')}
                    disabled={email === currentUser.email}
                    className="bg-black text-white px-6 rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Save
                </button>
              </div>
          </div>

          <div className="border-t border-gray-100 my-8"></div>

          {/* B. PASSWORD SECTION (FULL WIDTH) */}
          <div>
              <label className="text-xs font-bold text-gray-400 ml-1 mb-4 block uppercase tracking-wider">Change Password</label>
              
              <div className="space-y-4"> 
                  {/* Current Password */}
                  <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                          type="password" 
                          placeholder="Current Password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                          className={`w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-yellow-100 text-black ${INPUT_SHADOW}`}
                      />
                  </div>

                  {/* New Password */}
                  <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                          type="password" 
                          placeholder="New Password"
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          className={`w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-yellow-100 text-black ${INPUT_SHADOW}`}
                      />
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                          type="password" 
                          placeholder="Confirm New Password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                          className={`w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-yellow-100 text-black ${INPUT_SHADOW}`}
                      />
                  </div>

                  {/* Button */}
                  <div className="flex justify-end pt-2">
                    <button 
                        onClick={() => triggerConfirmation('password')}
                        disabled={!passwords.current || !passwords.new}
                        className="bg-gray-100 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        <Save size={16} /> Update Password
                    </button>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. DANGER ZONE */}
      <div className="bg-red-50/50 rounded-[2rem] border border-red-100 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-full text-red-600"><Trash2 size={20} /></div>
                  <h3 className="font-bold text-lg text-red-600">Delete Account</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium max-w-md leading-relaxed">
                  Permanently remove your account and all content. This action is not reversible.
              </p>
          </div>
          <button 
              onClick={() => triggerConfirmation('delete')}
              className="bg-white border border-red-200 text-red-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white hover:border-transparent transition-all shadow-sm whitespace-nowrap"
          >
              Delete Account
          </button>
      </div>

      {/* --- CONFIRMATION MODAL POPUP --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
            <div className={`relative bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-200 ${CARD_SHADOW}`}>
                 <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${modalData.color}`}>
                    {modalData.icon}
                 </div>
                 <h3 className="text-xl font-black text-black mb-2">{modalData.title}</h3>
                 <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
                    {modalData.desc}
                 </p>
                 <div className="flex gap-3">
                    <button 
                        onClick={() => setModalOpen(false)} 
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-black font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={modalData.action} 
                        className={`flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-colors ${modalData.btnColor}`}
                    >
                        {modalData.btnText}
                    </button>
                 </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default SettingsView;
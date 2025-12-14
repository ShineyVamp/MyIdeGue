import React, { useState } from 'react';
import { ViewState } from '../types'; // Naik satu level dari pages
import { CARD_SHADOW, INPUT_SHADOW } from '../components/Shadows'; // Masuk ke components
import { Eye, EyeOff, CheckCircle, ArrowRight, Check, XCircle } from 'lucide-react';
import { API_URL } from '../config/api'; // Naik satu level lalu ke config

const Auth = ({ view, setView, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ 
      username: '', 
      email: '', 
      password: '', 
      confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isLogin = view === ViewState.LOGIN;
  const isForgot = view === ViewState.FORGOT_PASSWORD;

  // --- LOGIC VALIDASI REAL-TIME ---
  const isPasswordLengthValid = formData.password.length >= 8;
  const isPasswordMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';
  const hasTypedConfirm = formData.confirmPassword.length > 0;

  const isRegisterValid = isPasswordLengthValid && isPasswordMatch;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // --- HANDLE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: formData.email, password: formData.password })
        });
        
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            throw new Error('Invalid Server Response');
        }
        
        if (res.ok) {
            onLoginSuccess(data); 
        } else {
            setError(data.message || 'Login failed');
        }
    } catch (err) {
        console.error("Login Error:", err);
        setError('Server error. Please check connection.');
    } finally {
        setIsLoading(false);
    }
  };

  // --- HANDLE REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isRegisterValid) return;

    setIsLoading(true);
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: formData.username, 
                email: formData.email, 
                password: formData.password
            })
        });
        
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
             throw new Error('Server error');
        }

        if (res.ok) {
            setShowSuccessModal(true);
        } else {
            setError(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error("Register Error:", err);
        setError('Server error. Please check backend connection.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
      if (isLogin) handleLogin(e);
      else if (!isForgot) handleRegister(e);
      else {
          e.preventDefault();
          setView(ViewState.LOGIN);
      }
  };

  const handleCloseModal = () => {
      setShowSuccessModal(false);
      setFormData({ username: '', email: '', password: '', confirmPassword: '' }); 
      setError('');
      setView(ViewState.LOGIN);
  };

  // ========== FORGOT PASSWORD PAGE ==========
  if (isForgot) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEF9E6] px-4 font-sans">
            <div className="bg-white p-14 rounded-[2.5rem] shadow-sm max-w-[550px] w-full border border-gray-100/50">
                <div className="text-center mt-4">
                    <h2 className="text-center font-medium text-black">Forgot Password</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1 mr-1">
                            <label className="block text-sm font-medium text-black">New Password</label>
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="flex items-center text-sm text-gray-400 font-medium gap-1 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                Hide
                            </button>
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full bg-[#E5E5E5] border-none rounded-xl px-5 py-4 text-black focus:ring-0 shadow-inner"
                            required
                        />
                        <div className="mt-5 text-[11px] text-gray-400 font-medium px-1">
                            <p>• Use 8 or more characters</p>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-[#80A1BA] text-white font-medium text-lg py-4 rounded-2xl hover:bg-[#6c8ea8] transition-all shadow-sm mt-8 active:scale-[0.99]"
                    >
                        Confirm
                    </button>
                </form>
            </div>
        </div>
    );
  }

  // ========== LOGIN / REGISTER PAGE ==========
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF9E6] px-4 font-sans">
      <div className={`bg-white p-14 rounded-[40px] shadow-sm max-w-[550px] w-full border border-gray-100/50 ${CARD_SHADOW} relative`}>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center mb-8">
              <span className="text-black">Myide</span>
              <span 
                  className="text-white ml-0.5"
                  style={{
                      WebkitTextStroke: '4px black',
                      paintOrder: 'stroke fill'
                  }}
              >
                  Gue
              </span>
          </h1>

          <h2 className="text-2xl font-semibold text-gray-800">
            {isLogin ? 'Log in' : 'Create an account'}
          </h2>
        </div>
        
        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl text-center border border-red-100 animate-pulse">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

            {/* USERNAME (REGISTER ONLY) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-black mb-2 ml-1">Username</label>
                <input 
                    name="username"
                    value={formData.username}
                    type="text"
                    className={`w-full bg-[#E5E5E5] rounded-xl p-4 focus:ring-1 focus:ring-gray-300 ${INPUT_SHADOW}`}
                    required
                    onChange={handleChange}
                />
              </div>
            )}

            {/* EMAIL / IDENTIFIER */}
            <div>
                <label className="block text-sm font-medium text-black mb-2 ml-1">
                    {isLogin ? 'Username / Email address' : 'Email'}
                </label>
                <input 
                    name="email"
                    value={formData.email}
                    type={isLogin ? "text" : "email"}
                    className={`w-full bg-[#E5E5E5] rounded-xl p-4 focus:ring-1 focus:ring-gray-300 ${INPUT_SHADOW}`}
                    required
                    onChange={handleChange}
                />
            </div>

            {/* PASSWORD */}
            <div>
                <div className="flex justify-between items-center mb-2 ml-1 mr-1">
                    <label className="block text-sm font-medium text-black">Password</label>
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex items-center text-sm text-gray-600 font-medium gap-1"
                    >
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                <input 
                    name="password"
                    value={formData.password}
                    type={showPassword ? "text" : "password"} 
                    className={`w-full bg-[#E5E5E5] rounded-xl p-4 pr-20 focus:ring-1 focus:ring-gray-300 ${INPUT_SHADOW}`}
                    required
                    onChange={handleChange}
                />

                {!isLogin && (
                  <div className={`mt-4 text-[11px] font-medium px-1 flex items-center gap-1.5 transition-colors duration-300 ${isPasswordLengthValid ? 'text-green-600' : 'text-gray-400'}`}>
                      {isPasswordLengthValid ? <Check size={14} strokeWidth={3} /> : <span>•</span>}
                      <p>Use 8 or more characters</p>
                  </div>
                )}
            </div>

            {/* CONFIRM PASSWORD (REGISTER ONLY) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-black mb-2 ml-1">Confirm Password</label>
                <input 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    type="password"
                    className={`w-full bg-[#E5E5E5] rounded-xl p-4 focus:ring-1 focus:ring-gray-300 ${INPUT_SHADOW}`}
                    required
                    onChange={handleChange}
                />
                
                {hasTypedConfirm && (
                    <div className={`mt-2 ml-1 flex items-center gap-2 text-xs font-bold ${isPasswordMatch ? 'text-green-600' : 'text-red-500'}`}>
                        {isPasswordMatch ? (
                            <>
                                <CheckCircle size={14} />
                                <span>Passwords match</span>
                            </>
                        ) : (
                            <>
                                <XCircle size={14} />
                                <span>Passwords do not match</span>
                            </>
                        )}
                    </div>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button 
                type="submit"
                disabled={isLoading || (!isLogin && !isRegisterValid)}
                className={`w-full bg-[#80A1BA] text-white font-bold text-lg py-4 rounded-full hover:bg-[#6c8ea8] transition-all shadow-lg mt-4 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isLoading ? 'Processing...' : (isLogin ? 'Log in' : 'Register')}
            </button>
        </form>

        {/* FOOTER LINKS */}
        <div className="text-center mt-8 text-sm">
            {isLogin ? (
                <>
                    <button 
                        onClick={() => setView(ViewState.FORGOT_PASSWORD)}
                        className="block mx-auto text-gray-400 underline hover:text-gray-600 mb-6"
                    >
                        Forgot Password?
                    </button>

                    <button 
                        onClick={() => { setView(ViewState.SIGNUP); setError(''); }}
                        className="text-black font-bold hover:underline text-base"
                    >
                        Create an account
                    </button>
                </>
            ) : (
                <p className="text-gray-500">
                    Already have an account? 
                    <button 
                        onClick={() => { setView(ViewState.LOGIN); setError(''); }}
                        className="text-black font-bold ml-1 hover:underline"
                    >
                        Log in
                    </button>
                </p>
            )}
        </div>

      </div>

      {/* --- SUCCESS MODAL POPUP --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"></div>
            
            <div className="relative bg-white w-full max-w-sm rounded-[40px] p-8 text-center shadow-2xl animate-in zoom-in duration-300 border border-white/50">
                 <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-sm border border-green-100">
                    <CheckCircle size={40} strokeWidth={2.5} />
                 </div>
                 
                 <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">Registration Successful!</h3>
                 <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
                    Your account has been created successfully. You can now login to start using the app.
                 </p>
                 
                 <button 
                    onClick={handleCloseModal} 
                    className="w-full py-4 rounded-full bg-[#80A1BA] text-white font-bold text-lg hover:bg-[#6c8ea8] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                    OK, Go to Login <ArrowRight size={20} />
                 </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Auth;
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="army-login-shell bg-[#0a0a0a] text-white min-h-screen flex items-center justify-center antialiased w-full p-4 sm:p-6 lg:p-12">
      <div className="army-login-card w-full max-w-[440px] bg-[#121212] border border-white/15 p-8 lg:p-10 shadow-2xl">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-white"></span>
              <h1 className="text-lg font-black font-display uppercase tracking-tighter text-white">SACRMS</h1>
            </div>
            <span className="text-[10px] font-mono text-white/40">SEC-AUTH</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/60 block" htmlFor="email">
                Service ID // Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@logistics.node"
                  className="w-full h-11 px-3 border border-white/15 bg-[#181818] font-mono text-xs text-white focus:border-white outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/60 block" htmlFor="password">
                Passcode
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 pr-10 border border-white/15 bg-[#181818] font-mono text-xs text-white focus:border-white outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] mt-2"
            >
              <span>Authenticate</span>
              <span className="material-symbols-outlined text-[16px] text-black">arrow_forward</span>
            </button>

commander@logistics.node   <br />     SACRMS-ADMIN
<br /> 
logistics.lead@camp-alpha.mil <br />  SACRMS_CAMP_ALPHA           
<br />
 logistics.lead@camp-bravo.mil   <br />  SACRMS_CAMP_BRAVO                          


          </form>

        </div>
      </div>
  );
};

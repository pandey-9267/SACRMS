import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login(email, password);
  };

  return (
    <div className="army-login-shell min-h-screen w-full overflow-y-auto px-4 py-2 text-white antialiased sm:px-8 lg:h-screen lg:overflow-hidden lg:px-12 lg:py-4">
      <div className="army-login-atmosphere" aria-hidden="true">
        <span className="army-login-grid" />
        <span className="army-login-scanline" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-7xl flex-col justify-between lg:h-full lg:min-h-0">
        <header className="flex items-start justify-between border-b border-white/20 pb-2">
          <div className="flex items-start gap-4">
            <div className="army-login-insignia">
              <span className="material-symbols-outlined">shield</span>
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[#e0c98d]">
                Government logistics network
              </p>
              <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-[0.08em] sm:text-5xl">
                SACRMS
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
                Smart Army Camp Resource Management System
              </p>
            </div>
          </div>
          <div className="hidden text-right font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 sm:block">
            <p>Secure access terminal</p>
            <p className="mt-2 text-[#9fb58b]">Network status: nominal</p>
          </div>
        </header>

        <main className="grid items-center gap-4 py-2 md:grid-cols-[1fr_440px] md:gap-10 lg:gap-16">
          <section className="hidden md:block">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#e0c98d]">
              Field command // logistics readiness
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-6xl font-black uppercase leading-[0.9] tracking-tight text-white xl:text-7xl">
              Hold the line.
              <br />
              <span className="text-[#d8c38e]">Keep every camp ready.</span>
            </h2>
            <p className="mt-5 max-w-xl border-l-2 border-[#d8c38e] pl-4 font-mono text-xs leading-5 text-white/65">
              A unified command picture for resources, equipment, consumption,
              maintenance and resupply across the operational grid.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-px border border-white/15 bg-white/15">
              <div className="bg-[#101710]/85 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/45">Mission</p>
                <p className="mt-2 font-display text-xl font-bold uppercase">Readiness</p>
              </div>
              <div className="bg-[#101710]/85 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/45">Coverage</p>
                <p className="mt-2 font-display text-xl font-bold uppercase">Multi-camp</p>
              </div>
              <div className="bg-[#101710]/85 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/45">Protocol</p>
                <p className="mt-2 font-display text-xl font-bold uppercase">Secure</p>
              </div>
            </div>
          </section>

          <section className="army-login-card w-full border border-[#d8c38e]/45 bg-[#101710]/90 p-4 shadow-2xl backdrop-blur-md sm:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#e0c98d]">Personnel verification</p>
                <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wider">Authenticate</h2>
              </div>
              <div className="army-login-status-dot" title="Secure terminal online" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-white/60" htmlFor="email">
                  Service ID // Email
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="commander@logistics.node"
                  className="w-full border border-white/20 bg-[#182219] px-3 py-2.5 font-mono text-xs text-white outline-none transition-all focus:border-[#e0c98d] focus:ring-1 focus:ring-[#e0c98d]/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-white/60" htmlFor="password">
                  Passcode
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-white/20 bg-[#182219] px-3 py-2.5 pr-10 font-mono text-xs text-white outline-none transition-all focus:border-[#e0c98d] focus:ring-1 focus:ring-[#e0c98d]/30"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/45 hover:text-[#e0c98d]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="group flex h-11 w-full cursor-pointer items-center justify-center gap-3 bg-[#d8c38e] font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#172016] shadow-lg transition-all hover:bg-[#ead9a9] active:scale-[0.99]"
              >
                <span>Enter command network</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </form>

            <div className="mt-4 border-t border-white/15 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">Demo access credentials</p>
                <span className="font-mono text-[9px] text-[#9fb58b]">DEV ONLY</span>
              </div>
              <div className="space-y-1.5 font-mono text-[10px] text-white/65">
                <p><span className="text-[#e0c98d]">HQ ADMIN</span> // commander@logistics.node // SACRMS-ADMIN</p>
                <p><span className="text-[#e0c98d]">CAMP ALPHA</span> // logistics.lead@camp-alpha.mil // SACRMS_CAMP_ALPHA</p>
                <p><span className="text-[#e0c98d]">CAMP BRAVO</span> // logistics.lead@camp-bravo.mil // SACRMS_CAMP_BRAVO</p>
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-2 border-t border-white/20 pt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>Service before self // readiness through discipline</p>
          <p>System time // secure session gateway</p>
        </footer>
      </div>
    </div>
  );
};

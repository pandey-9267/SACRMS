import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const CampsView: React.FC = () => {
  const { currentUser, createCampProfile, resetAllData } = useApp();
  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'Live' as 'Live' | 'Reserve' | 'Forward Base',
    location: '',
    commander: '',
    personnel: 120,
    readinessScore: 80,
    weather: 'Clear',
    temperature: '22°C / 72°F',
  });
  const [createdCredentials, setCreatedCredentials] = useState<{ profileEmail: string; profilePassword: string } | null>(null);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createCampProfile(form);
    if (result) {
      setCreatedCredentials({ profileEmail: result.profileEmail, profilePassword: result.profilePassword });
      setForm({
        name: '',
        code: '',
        type: 'Live',
        location: '',
        commander: '',
        personnel: 120,
        readinessScore: 80,
        weather: 'Clear',
        temperature: '22°C / 72°F',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-white/40">HQ ADMIN</p>
          <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">Camp Access</h1>
        </div>
        {currentUser?.role === 'Admin' && (
          <button
            type="button"
            onClick={resetAllData}
            className="border border-white/20 text-white px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-white/5"
          >
            Delete All
          </button>
        )}
      </div>

      <form onSubmit={handleCreateCamp} className="bg-[#121212] border border-white/10 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1 text-[10px] font-mono uppercase text-white/60">
            Camp Name
            <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full h-10 border border-white/15 bg-[#0d0d0d] px-3 text-white" required />
          </label>
          <label className="space-y-1 text-[10px] font-mono uppercase text-white/60">
            Camp Code
            <input value={form.code} onChange={(e) => handleChange('code', e.target.value)} className="w-full h-10 border border-white/15 bg-[#0d0d0d] px-3 text-white" required />
          </label>
          <label className="space-y-1 text-[10px] font-mono uppercase text-white/60">
            Camp Type
            <select value={form.type} onChange={(e) => handleChange('type', e.target.value)} className="w-full h-10 border border-white/15 bg-[#0d0d0d] px-3 text-white">
              <option value="Live">Live</option>
              <option value="Reserve">Reserve</option>
              <option value="Forward Base">Forward Base</option>
            </select>
          </label>
          <label className="space-y-1 text-[10px] font-mono uppercase text-white/60">
            Personnel Count
            <input type="number" value={form.personnel} onChange={(e) => handleChange('personnel', Number(e.target.value))} className="w-full h-10 border border-white/15 bg-[#0d0d0d] px-3 text-white" min={0} required />
          </label>
          <label className="space-y-1 text-[10px] font-mono uppercase text-white/60 md:col-span-2">
            Location
            <input value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="w-full h-10 border border-white/15 bg-[#0d0d0d] px-3 text-white" required />
          </label>
          <label className="space-y-1 text-[10px] font-mono uppercase text-white/60">
            Commander Name
            <input value={form.commander} onChange={(e) => handleChange('commander', e.target.value)} className="w-full h-10 border border-white/15 bg-[#0d0d0d] px-3 text-white" required />
          </label>
          <label className="space-y-1 text-[10px] font-mono uppercase text-white/60">
            Readiness Score
            <input type="number" value={form.readinessScore} onChange={(e) => handleChange('readinessScore', Number(e.target.value))} className="w-full h-10 border border-white/15 bg-[#0d0d0d] px-3 text-white" min={0} max={100} required />
          </label>
          <label className="space-y-1 text-[10px] font-mono uppercase text-white/60">
            Weather
            <input value={form.weather} onChange={(e) => handleChange('weather', e.target.value)} className="w-full h-10 border border-white/15 bg-[#0d0d0d] px-3 text-white" required />
          </label>
          <label className="space-y-1 text-[10px] font-mono uppercase text-white/60">
            Temperature
            <input value={form.temperature} onChange={(e) => handleChange('temperature', e.target.value)} className="w-full h-10 border border-white/15 bg-[#0d0d0d] px-3 text-white" required />
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-white text-black px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-neutral-200">
            Save & Create Credentials
          </button>
        </div>
      </form>

      {createdCredentials && (
        <div className="bg-[#121212] border border-white/10 p-4 space-y-2">
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Camp Credentials</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-white/80">
            <div className="border border-white/10 bg-[#0d0d0d] p-3">
              <span className="block text-white/40 uppercase tracking-[0.2em] mb-1">Username</span>
              {createdCredentials.profileEmail}
            </div>
            <div className="border border-white/10 bg-[#0d0d0d] p-3">
              <span className="block text-white/40 uppercase tracking-[0.2em] mb-1">Password</span>
              {createdCredentials.profilePassword}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

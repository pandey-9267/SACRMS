import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import hqAdminPhoto from '../../../assets/phot.jpeg';

export const UsersView: React.FC = () => {
  const { currentUser, camps, logout, deleteCampProfile } = useApp();
  const [profiles, setProfiles] = useState<UserProfile[]>(currentUser ? [currentUser] : []);
  const [passwords, setPasswords] = useState<Record<string, string>>({});

  const loadProfiles = useCallback(() => {
    const storedProfiles = JSON.parse(localStorage.getItem('sacrms_profiles') || '[]') as UserProfile[];
    const storedPasswords = JSON.parse(localStorage.getItem('sacrms_profile_passwords') || '{}') as Record<string, string>;
    const activeCampIds = new Set(camps.map((camp) => camp.id));
    const merged = currentUser
      ? [currentUser, ...storedProfiles.filter((profile) => profile.email !== currentUser.email && activeCampIds.has(profile.campId))]
      : storedProfiles.filter((profile) => activeCampIds.has(profile.campId));

    setProfiles(merged);
    setPasswords(storedPasswords);
  }, [camps, currentUser]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleDeleteCamp = async (campId: string) => {
    await deleteCampProfile(campId);
    loadProfiles();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">
            Personnel & Roles
          </h1>
          <p className="text-xs font-mono text-white/50 uppercase tracking-[0.2em] mt-1">
            AUTHORIZED LOGISTICS OFFICERS & SECURE CREDENTIAL IDENTITIES
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profiles.map((user) => {
          const isActive = currentUser?.email === user.email;
          const passcode = passwords[user.email.toLowerCase()] || 'SACRMS-ADMIN';
          const avatarUrl = user.email === 'commander@logistics.node' ? hqAdminPhoto : user.avatarUrl;
          return (
            <div
              key={user.id}
              className={`relative p-6 transition-all ${
                isActive
                  ? 'bg-white text-black shadow-2xl'
                  : 'bg-[#121212] border border-white/10 text-white hover:border-white/30'
              }`}
            >
              {user.role === 'Logistics' && user.accessScope === 'Camp' && (
                <button
                  type="button"
                  onClick={() => handleDeleteCamp(user.campId)}
                  className="absolute right-3 top-3 h-7 w-7 rounded-md border border-[#5fa8ff]/40 bg-[#0d1f30] text-[#8ec7ff] flex items-center justify-center shadow-md hover:bg-[#14304d] transition-colors"
                  aria-label={`Delete ${user.name}`}
                  title={`Delete ${user.name}`}
                >
                  <span className="material-symbols-outlined text-[17px]">delete</span>
                </button>
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 border overflow-hidden shrink-0 ${isActive ? 'border-black' : 'border-white/20'}`}>
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover grayscale" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black font-display uppercase tracking-tight text-base ${isActive ? 'text-black' : 'text-white'}`}>
                      {user.name}
                    </h3>
                    {isActive && (
                      <span className="bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.2 uppercase">CURRENT</span>
                    )}
                  </div>
                  <p className={`text-xs font-mono font-bold uppercase ${isActive ? 'text-black/80' : 'text-white/80'}`}>{user.role}</p>
                  <p className={`text-[10px] font-mono ${isActive ? 'text-black/50' : 'text-white/40'}`}>{user.serviceId}</p>
                </div>
              </div>

              <div className={`space-y-2 text-xs font-mono border-t pt-3 mb-5 ${isActive ? 'border-black/10' : 'border-white/10'}`}>
                <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-2 items-start">
                  <span className={isActive ? 'text-black/50' : 'text-white/40'}>RANK:</span>
                  <span className="font-bold uppercase break-words">{user.rank}</span>
                </div>
                <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-2 items-start">
                  <span className={isActive ? 'text-black/50' : 'text-white/40'}>EMAIL:</span>
                  <span className="break-words">{user.email}</span>
                </div>
                <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-2 items-start">
                  <span className={isActive ? 'text-black/50' : 'text-white/40'}>PASS:</span>
                  <span className="break-words">{passcode}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className={`w-full py-2.5 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-neutral-200 shadow-sm'
                }`}
              >
                {isActive ? 'Active Identity' : 'Sign Out To Switch'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

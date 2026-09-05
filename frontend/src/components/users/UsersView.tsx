import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import hqAdminPhoto from '../../../assets/phot.jpeg';

export const UsersView: React.FC = () => {
  const {
    currentUser,
    camps,
    logout,
    deleteCampProfile,
  } = useApp();

  const [profiles, setProfiles] = useState<UserProfile[]>(
    currentUser ? [currentUser] : []
  );

  const loadProfiles = useCallback(() => {
    const activeCampIds = new Set(
      camps.map((camp) => camp.id)
    );

    /*
     * Keep the current logged-in user.
     *
     * Logistics users are loaded from the profiles
     * already maintained by the application context.
     *
     * No password localStorage is used.
     */
    const storedProfiles = JSON.parse(
      localStorage.getItem('sacrms_profiles') || '[]'
    ) as UserProfile[];

    const merged = currentUser
      ? [
          currentUser,
          ...storedProfiles.filter(
            (profile) =>
              profile.email !== currentUser.email &&
              (
                !profile.campId ||
                activeCampIds.has(profile.campId)
              )
          ),
        ]
      : storedProfiles.filter(
          (profile) =>
            !profile.campId ||
            activeCampIds.has(profile.campId)
        );

    setProfiles(merged);
  }, [camps, currentUser]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleDeleteCamp = async (campId: string) => {
    await deleteCampProfile(campId);
    loadProfiles();
  };

  /*
   * Generates the same temporary password that the
   * backend creates during camp creation.
   *
   * Backend:
   * SACRMS_${CAMP_NAME}
   *
   * Example:
   * CAMP_ALPHA → SACRMS_CAMP_ALPHA
   * CAMP_BRAVO → SACRMS_CAMP_BRAVO
   * XSDFG      → SACRMS_XSDFG
   */
  const getCampPassword = (campId: string | null) => {
    if (!campId) {
      return 'SACRMS-ADMIN';
    }

    const camp = camps.find(
      (item) => item.id === campId
    );

    if (!camp) {
      return 'SACRMS-ADMIN';
    }

    const passwordCampName = String(camp.name)
      .trim()
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();

    return `SACRMS_${passwordCampName}`;
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

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

      {/* =====================================================
          USER CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {profiles.map((user) => {

          const isActive =
            currentUser?.email === user.email;

          /*
           * HQ ADMIN
           */
          const isHQAdmin =
            user.email === 'commander@logistics.node';

          /*
           * Find assigned camp
           */
          const assignedCamp =
            user.campId
              ? camps.find(
                  (camp) =>
                    camp.id === user.campId
                )
              : undefined;

          /*
           * PASSWORD
           *
           * HQ:
           * SACRMS-ADMIN
           *
           * Camp:
           * SACRMS_CAMP_ALPHA
           * SACRMS_CAMP_BRAVO
           * SACRMS_XSDFG
           */
          const passcode = isHQAdmin
            ? 'SACRMS-ADMIN'
            : getCampPassword(user.campId);

          /*
           * HQ photo
           */
          const avatarUrl = isHQAdmin
            ? hqAdminPhoto
            : user.avatarUrl;

          return (
            <div
              key={user.id}
              className={`relative p-6 transition-all ${
                isActive
                  ? 'bg-[#d9c89d] text-black shadow-2xl'
                  : 'bg-[#121212] border border-white/10 text-white hover:border-white/30'
              }`}
            >

              {/* =================================================
                  DELETE CAMP
              ================================================= */}

              {user.role === 'Logistics' &&
                user.accessScope === 'Camp' && (
                  <button
                    type="button"
                    onClick={() =>
                      user.campId &&
                      handleDeleteCamp(user.campId)
                    }
                    className="absolute right-3 top-3 h-7 w-7 rounded-md border border-[#5fa8ff]/40 bg-[#0d1f30] text-[#8ec7ff] flex items-center justify-center shadow-md hover:bg-[#14304d] transition-colors"
                    aria-label={`Delete ${user.name}`}
                    title={`Delete ${user.name}`}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      delete
                    </span>
                  </button>
                )}

              {/* =================================================
                  USER HEADER
              ================================================= */}

              <div className="flex items-center gap-4 mb-4">

                <div
                  className={`w-12 h-12 border overflow-hidden shrink-0 ${
                    isActive
                      ? 'border-black'
                      : 'border-white/20'
                  }`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover grayscale"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black text-white font-mono font-bold">
                      {user.name
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h3
                      className={`font-black font-display uppercase tracking-tight text-base ${
                        isActive
                          ? 'text-black'
                          : 'text-white'
                      }`}
                    >
                      {user.name}
                    </h3>

                    {isActive && (
                      <span className="bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase">
                        CURRENT
                      </span>
                    )}

                  </div>

                  <p
                    className={`text-xs font-mono font-bold uppercase ${
                      isActive
                        ? 'text-black/80'
                        : 'text-white/80'
                    }`}
                  >
                    {user.role}
                  </p>

                  <p
                    className={`text-[10px] font-mono ${
                      isActive
                        ? 'text-black/50'
                        : 'text-white/40'
                    }`}
                  >
                    {user.serviceId}
                  </p>

                </div>

              </div>

              {/* =================================================
                  ASSIGNED CAMP
              ================================================= */}

              {user.role === 'Logistics' &&
                assignedCamp && (
                  <div
                    className={`mb-4 border p-3 ${
                      isActive
                        ? 'border-black/20'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex justify-between gap-3 text-[10px] font-mono font-bold uppercase">

                      <span
                        className={
                          isActive
                            ? 'text-black/50'
                            : 'text-white/40'
                        }
                      >
                        ASSIGNED CAMP
                      </span>

                      <span>
                        {assignedCamp.code}
                      </span>

                    </div>

                    <div className="text-xs font-mono font-bold uppercase mt-1">
                      {assignedCamp.name}
                    </div>
                  </div>
                )}

              {/* =================================================
                  DETAILS
              ================================================= */}

              <div
                className={`space-y-2 text-xs font-mono border-t pt-3 mb-5 ${
                  isActive
                    ? 'border-black/10'
                    : 'border-white/10'
                }`}
              >

                {/* RANK */}

                <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-2 items-start">

                  <span
                    className={
                      isActive
                        ? 'text-black/50'
                        : 'text-white/40'
                    }
                  >
                    RANK:
                  </span>

                  <span className="font-bold uppercase break-words">
                    {user.rank}
                  </span>

                </div>

                {/* EMAIL */}

                <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-2 items-start">

                  <span
                    className={
                      isActive
                        ? 'text-black/50'
                        : 'text-white/40'
                    }
                  >
                    EMAIL:
                  </span>

                  <span className="break-words">
                    {user.email}
                  </span>

                </div>

                {/* PASSWORD */}

                <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-2 items-start">

                  <span
                    className={
                      isActive
                        ? 'text-black/50'
                        : 'text-white/40'
                    }
                  >
                    PASS:
                  </span>

                  <span className="font-bold break-words">
                    {passcode}
                  </span>

                </div>

              </div>

              {/* =================================================
                  SWITCH / ACTIVE BUTTON
              ================================================= */}

              <button
                onClick={logout}
                className={`w-full py-2.5 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-[#d9c89d] text-black hover:bg-[#c9b886] shadow-sm'
                }`}
              >
                {isActive
                  ? 'Active Identity'
                  : 'Sign Out To Switch'}
              </button>

            </div>
          );
        })}

      </div>
    </div>
  );
};
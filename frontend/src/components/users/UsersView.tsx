import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});

  /*
   * Generate a unique avatar for a camp logistics user.
   * This is a USER avatar, not the camp profile image.
   */
  const generateUserAvatar = (name: string, email: string) => {
    const initials =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'US';

    const label = encodeURIComponent(`${initials} ${email.split('@')[0]}`);

    return `https://ui-avatars.com/api/?name=${label}&size=200&background=111827&color=ffffff&bold=true`;
  };

  const loadProfiles = useCallback(() => {
    const storedProfiles = JSON.parse(
      localStorage.getItem('sacrms_profiles') || '[]'
    ) as UserProfile[];

    const storedPasswords = JSON.parse(
      localStorage.getItem('sacrms_profile_passwords') || '{}'
    ) as Record<string, string>;

    setPasswords(storedPasswords);

    /*
     * ADMIN / HQ profile
     */
    const adminProfile = currentUser
      ? {
          ...currentUser,
          avatarUrl:
            currentUser.role === 'Admin'
              ? hqAdminPhoto
              : currentUser.avatarUrl,
        }
      : null;

    /*
     * Create a user profile for EVERY camp.
     *
     * This is the important fix:
     * Even if sacrms_profiles does not contain Alpha/Bravo,
     * the camp itself exists in MongoDB, so we create the
     * corresponding Logistics user card from the camp data.
     */
    const campProfiles: UserProfile[] = camps.map((camp) => {
      const existingProfile = storedProfiles.find(
        (profile) => profile.campId === camp.id
      );

      if (existingProfile) {
        return existingProfile;
      }

      const safeName = String(camp.name || 'Camp').trim();

      const normalizedName = safeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const email = `logistics.lead@${normalizedName}.mil`;

      const commanderName =
        String(camp.commander || '').trim() ||
        `${safeName} Logistics Lead`;

      const serviceId = `SVC-${String(camp.code || camp.id)
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 8)
        .toUpperCase()}`;

      return {
        id: `camp-profile-${camp.id}`,
        name: commanderName,
        email,
        role: 'Logistics',
        rank: `${safeName} Logistics Lead`,
        campId: camp.id,
        avatarUrl: generateUserAvatar(commanderName, email),
        serviceId,
        accessScope: 'Camp',
      };
    });

    /*
     * Save any reconstructed profiles back into localStorage.
     * This means they will remain available on the next refresh.
     */
    const existingProfileIds = new Set(
      storedProfiles.map((profile) => profile.campId)
    );

    const missingProfiles = campProfiles.filter(
      (profile) =>
        profile.campId &&
        !existingProfileIds.has(profile.campId)
    );

    if (missingProfiles.length > 0) {
      localStorage.setItem(
        'sacrms_profiles',
        JSON.stringify([
          ...storedProfiles,
          ...missingProfiles,
        ])
      );
    }

    /*
     * HQ first, then all camp logistics users.
     */
    const mergedProfiles = [
      ...(adminProfile ? [adminProfile] : []),
      ...campProfiles.filter(
        (profile) =>
          profile.email !== currentUser?.email
      ),
    ];

    setProfiles(mergedProfiles);
  }, [camps, currentUser]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleDeleteCamp = async (campId: string) => {
    await deleteCampProfile(campId);
    loadProfiles();
  };

  const activeCampIds = useMemo(
    () => new Set(camps.map((camp) => camp.id)),
    [camps]
  );

  /*
   * Remove any stale camp profiles that no longer exist.
   */
  const visibleProfiles = profiles.filter(
    (profile) =>
      profile.role === 'Admin' ||
      !profile.campId ||
      activeCampIds.has(profile.campId)
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
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

      {/* USER PROFILE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleProfiles.map((user) => {
          const isActive =
            currentUser?.email?.toLowerCase() ===
            user.email?.toLowerCase();

          const passcode =
            passwords[user.email.toLowerCase()] ||
            'Generated During Camp Creation';

          /*
           * HQ gets HQ photo.
           * Camp users get their own user avatar.
           */
          const avatarUrl =
            user.role === 'Admin'
              ? hqAdminPhoto
              : user.avatarUrl ||
                generateUserAvatar(
                  user.name,
                  user.email
                );

          const assignedCamp = user.campId
            ? camps.find(
                (camp) => camp.id === user.campId
              )
            : null;

          return (
            <div
              key={`${user.id}-${user.email}`}
              className={`relative p-6 transition-all ${
                isActive
                  ? 'bg-white text-black shadow-2xl'
                  : 'bg-[#121212] border border-white/10 text-white hover:border-white/30'
              }`}
            >
              {/* DELETE CAMP */}
              {user.role === 'Logistics' &&
                user.accessScope === 'Camp' &&
                user.campId && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteCamp(user.campId!)
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

              {/* USER HEADER */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 border overflow-hidden shrink-0 ${
                    isActive
                      ? 'border-black'
                      : 'border-white/20'
                  }`}
                >
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover grayscale"
                    onError={(event) => {
                      event.currentTarget.src =
                        generateUserAvatar(
                          user.name,
                          user.email
                        );
                    }}
                  />
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
                      <span className="bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.2 uppercase">
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

              {/* ASSIGNED CAMP */}
              {assignedCamp && (
                <div
                  className={`border p-3 mb-4 ${
                    isActive
                      ? 'border-black/20'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[10px] font-mono uppercase ${
                        isActive
                          ? 'text-black/50'
                          : 'text-white/40'
                      }`}
                    >
                      ASSIGNED CAMP
                    </span>

                    <span className="text-xs font-mono font-bold uppercase">
                      {assignedCamp.code}
                    </span>
                  </div>

                  <div
                    className={`text-xs font-mono font-bold uppercase mt-1 ${
                      isActive
                        ? 'text-black'
                        : 'text-white'
                    }`}
                  >
                    {assignedCamp.name}
                  </div>
                </div>
              )}

              {/* USER DETAILS */}
              <div
                className={`space-y-2 text-xs font-mono border-t pt-3 mb-5 ${
                  isActive
                    ? 'border-black/10'
                    : 'border-white/10'
                }`}
              >
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

                  <span className="break-words">
                    {passcode}
                  </span>
                </div>
              </div>

              {/* SWITCH / ACTIVE */}
              <button
                onClick={logout}
                className={`w-full py-2.5 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-neutral-200 shadow-sm'
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
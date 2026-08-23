const STORAGE_KEY = 'movieiguess.profiles.v1';
const ACTIVE_KEY = 'movieiguess.activeProfile.v1';
const ACTIVE_PROFILE_MAX_AGE = 5 * 60 * 60 * 1000;

const DEFAULT_PROFILES = [];

export function getProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
      return [...DEFAULT_PROFILES];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_PROFILES];
    }

    const profiles =
      parsed.filter(profile =>
        profile.id !== 'default'
      );

    if (profiles.length !== parsed.length) {
      saveProfiles(profiles);
    }

    return profiles;
  } catch {
    return [...DEFAULT_PROFILES];
  }
}

export function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function addProfile(profile) {
  const profiles = getProfiles();
  const next = {
    id: crypto.randomUUID ? crypto.randomUUID() : `profile-${Date.now()}`,
    name: profile.name.trim(),
    color: profile.color || '#e50914',
    kids: Boolean(profile.kids),
    preferences: Array.isArray(profile.preferences)
      ? profile.preferences
      : [],
    favoriteTitles: Array.isArray(profile.favoriteTitles)
      ? profile.favoriteTitles
      : []
  };
  profiles.push(next);
  saveProfiles(profiles);
  return next;
}

export function updateProfile(id, patch) {
  const profiles = getProfiles().map((profile) =>
    profile.id === id ? { ...profile, ...patch } : profile
  );
  saveProfiles(profiles);
}

export function deleteProfile(id) {
  const profiles = getProfiles().filter((profile) => profile.id !== id);
  saveProfiles(profiles);
  if (getActiveProfileId() === id) clearActiveProfile();
}

export function setActiveProfile(id) {
  localStorage.setItem(
    ACTIVE_KEY,
    JSON.stringify({
      profileId: id,
      selectedAt: Date.now()
    })
  );
}

export function getActiveProfileId() {
  return getActiveProfileSession()?.profileId || null;
}

export function getActiveProfileSession() {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    const session =
      typeof parsed === 'string'
        ? {
            profileId: parsed,
            selectedAt: 0
          }
        : parsed;

    if (
      !session?.profileId ||
      !session.selectedAt
    ) {
      clearActiveProfile();
      return null;
    }

    const age =
      Date.now() - session.selectedAt;

    if (
      age < 0 ||
      age >= ACTIVE_PROFILE_MAX_AGE
    ) {
      clearActiveProfile();
      return null;
    }

    return session;
  } catch {
    clearActiveProfile();
    return null;
  }
}

export function clearActiveProfile() {
  localStorage.removeItem(ACTIVE_KEY);
}

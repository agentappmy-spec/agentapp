// Username validation utilities

const RESERVED_USERNAMES = [
    'admin', 'api', 'app', 'settings', 'login', 'signup', 'register',
    'dashboard', 'profile', 'user', 'users', 'account', 'help', 'support',
    'about', 'contact', 'terms', 'privacy', 'public', 'static', 'assets',
    'agentapp', 'super', 'superadmin', 'root', 'system', 'test'
];

export const validateUsername = (username) => {
    if (!username) {
        return { valid: false, error: 'Username is required' };
    }

    // Convert to lowercase for validation
    const lower = username.toLowerCase().trim();

    // Length check
    if (lower.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (lower.length > 20) {
        return { valid: false, error: 'Username must be 20 characters or less' };
    }

    // Format check (alphanumeric, underscore, hyphen only)
    if (!/^[a-z0-9_-]+$/.test(lower)) {
        return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }

    // Cannot start or end with hyphen/underscore
    if (/^[-_]|[-_]$/.test(lower)) {
        return { valid: false, error: 'Username cannot start or end with a hyphen or underscore' };
    }

    // Reserved words check
    if (RESERVED_USERNAMES.includes(lower)) {
        return { valid: false, error: 'This username is reserved' };
    }

    return { valid: true, username: lower };
};

export const formatUsername = (username) => {
    if (!username) return '';
    return username.toLowerCase().trim();
};

export const getPublicUrl = (username) => {
    if (!username) return '';
    return `${window.location.origin}/@${formatUsername(username)}`;
};

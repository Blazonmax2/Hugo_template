type AuthUser = {
    name: string;
    email: string;
};

const STORAGE_KEY = 'memorix_auth_user';

function readUserFromStorage(): AuthUser | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.name === 'string' && typeof parsed?.email === 'string') {
            return { name: parsed.name, email: parsed.email };
        }
    } catch {
        // Ignore malformed storage
    }
    return null;
}

function writeUserToStorage(user: AuthUser | null) {
    try {
        if (user) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // Storage might be unavailable (private mode, etc.)
    }
}

function setupAuthUI() {
    const loginButton = document.getElementById('auth-login-button') as HTMLButtonElement | null;
    const logoutButton = document.getElementById('auth-logout-button') as HTMLButtonElement | null;
    const userPanel = document.getElementById('auth-user-panel') as HTMLElement | null;
    const usernameSpan = document.getElementById('auth-username') as HTMLSpanElement | null;

    const backdrop = document.getElementById('auth-modal-backdrop') as HTMLElement | null;
    const closeButton = document.getElementById('auth-modal-close') as HTMLButtonElement | null;
    const form = document.getElementById('auth-form') as HTMLFormElement | null;
    const nameInput = document.getElementById('auth-name') as HTMLInputElement | null;
    const emailInput = document.getElementById('auth-email') as HTMLInputElement | null;

    if (!loginButton || !logoutButton || !userPanel || !usernameSpan || !backdrop || !closeButton || !form || !nameInput || !emailInput) {
        return;
    }

    const openModal = () => {
        backdrop.classList.remove('auth-hidden');
        backdrop.setAttribute('aria-hidden', 'false');
        window.setTimeout(() => nameInput.focus(), 50);
    };

    const closeModal = () => {
        backdrop.classList.add('auth-hidden');
        backdrop.setAttribute('aria-hidden', 'true');
        form.reset();
    };

    const renderState = () => {
        const user = readUserFromStorage();
        const isLoggedIn = !!user;

        if (isLoggedIn && user) {
            usernameSpan.textContent = user.name;
        } else {
            usernameSpan.textContent = '';
        }

        if (isLoggedIn) {
            userPanel.classList.remove('auth-hidden');
            loginButton.classList.add('auth-hidden');
        } else {
            userPanel.classList.add('auth-hidden');
            loginButton.classList.remove('auth-hidden');
        }
    };

    loginButton.addEventListener('click', () => {
        openModal();
    });

    logoutButton.addEventListener('click', () => {
        writeUserToStorage(null);
        renderState();
    });

    closeButton.addEventListener('click', () => {
        closeModal();
    });

    backdrop.addEventListener('click', event => {
        if (event.target === backdrop) {
            closeModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !backdrop.classList.contains('auth-hidden')) {
            closeModal();
        }
    });

    form.addEventListener('submit', event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name || !email) {
            form.classList.add('auth-form--invalid');
            return;
        }

        writeUserToStorage({ name, email });
        closeModal();
        renderState();
    });

    // Initial render using any existing session
    renderState();
}

window.addEventListener('load', () => {
    setupAuthUI();
});


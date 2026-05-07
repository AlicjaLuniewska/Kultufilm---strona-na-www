function getUsers() {
    const users = localStorage.getItem('kf_users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('kf_users', JSON.stringify(users));
}

document.addEventListener('DOMContentLoaded', () => {

    // MENU BUTTONY
    const loginBtn = document.querySelector('[data-view="login"]');
    const registerBtn = document.querySelector('[data-view="register"]');
    const profileBtn = document.querySelector('[data-view="profile"]');

    // PROFIL
    const profileName = document.getElementById('profile-name');
    const profileStatus = document.getElementById('profile-status');
    const logoutBtn = document.getElementById('logout-btn');

    // =========================
    // AKTUALIZACJA UI
    // =========================

    function updateUI() {

        const currentUser = localStorage.getItem('currentUser');

        // DOMYŚLNIE UKRYJ PROFIL
        if (profileBtn) {
            profileBtn.parentElement.style.display = "none";
        }

        if (currentUser) {

            // POKAŻ PROFIL
            if (profileBtn) {
                profileBtn.parentElement.style.display = "block";
            }

            // UKRYJ LOGOWANIE I REJESTRACJĘ
            if (loginBtn) {
                loginBtn.parentElement.style.display = "none";
            }

            if (registerBtn) {
                registerBtn.parentElement.style.display = "none";
            }

            // DANE PROFILU
            if (profileName) {
                profileName.textContent = currentUser;
            }

            if (profileStatus) {
                profileStatus.textContent = "Jesteś zalogowany.";
            }

            if (logoutBtn) {
                logoutBtn.style.display = "inline-block";
            }

        } else {

            // POKAŻ LOGOWANIE I REJESTRACJĘ
            if (loginBtn) {
                loginBtn.parentElement.style.display = "block";
            }

            if (registerBtn) {
                registerBtn.parentElement.style.display = "block";
            }

            // UKRYJ PROFIL
            if (profileBtn) {
                profileBtn.parentElement.style.display = "none";
            }

            // PROFIL OFFLINE
            if (profileName) {
                profileName.textContent = "Nie jesteś zalogowany";
            }

            if (profileStatus) {
                profileStatus.textContent = "Zaloguj się aby korzystać z profilu.";
            }

            if (logoutBtn) {
                logoutBtn.style.display = "none";
            }
        }
    }

    updateUI();

    // =========================
    // REJESTRACJA
    // =========================

    const regForm = document.getElementById('registerForm');

    if (regForm) {

        regForm.addEventListener('submit', (e) => {

            e.preventDefault();

            const user = document.getElementById('regUser').value.trim();
            const pass = document.getElementById('regPass').value;

            const msg = document.getElementById('register-message');

            let users = getUsers();

            if (users.find(u => u.username === user)) {

                msg.textContent = "Użytkownik już istnieje!";
                msg.style.color = "red";

                return;
            }

            users.push({
                username: user,
                password: pass
            });

            saveUsers(users);

            msg.textContent = "Konto utworzone!";
            msg.style.color = "lime";

            regForm.reset();
        });
    }

    // =========================
    // LOGOWANIE
    // =========================

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {

        loginForm.addEventListener('submit', (e) => {

            e.preventDefault();

            const user = document.getElementById('loginUser').value.trim();
            const pass = document.getElementById('loginPass').value;

            const msg = document.getElementById('login-message');

            let users = getUsers();

            const foundUser = users.find(
                u => u.username === user && u.password === pass
            );

            if (foundUser) {

                localStorage.setItem('currentUser', user);

                msg.textContent = `Witaj ${user}!`;
                msg.style.color = "lime";

                // ODŚWIEŻENIE
                location.reload();

            } else {

                msg.textContent = "Błędne dane logowania.";
                msg.style.color = "red";
            }
        });
    }

    // =========================
    // WYLOGOWANIE
    // =========================

    if (logoutBtn) {

        logoutBtn.addEventListener('click', () => {

            localStorage.removeItem('currentUser');

            // ODŚWIEŻ STRONĘ
            location.reload();
        });
    }
});
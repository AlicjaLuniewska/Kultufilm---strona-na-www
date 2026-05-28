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

    // ==========================================
    // AKTUALIZACJA INTERFEJSU (UI)
    // ==========================================
    function updateUI() {
        const currentUser = localStorage.getItem('currentUser');

        if (profileBtn) {
            profileBtn.parentElement.style.display = "none";
        }

        if (currentUser) {
            if (profileBtn) profileBtn.parentElement.style.display = "block";
            if (loginBtn) loginBtn.parentElement.style.display = "none";
            if (registerBtn) registerBtn.parentElement.style.display = "none";

            if (profileName) profileName.textContent = currentUser;
            if (profileStatus) profileStatus.textContent = "Jesteś zalogowany.";
            if (logoutBtn) logoutBtn.style.display = "inline-block";

        } else {
            if (loginBtn) loginBtn.parentElement.style.display = "block";
            if (registerBtn) registerBtn.parentElement.style.display = "block";
            if (profileBtn) profileBtn.parentElement.style.display = "none";

            if (profileName) profileName.textContent = "Nie jesteś zalogowany";
            if (profileStatus) profileStatus.textContent = "Zaloguj się aby korzystać z profilu.";
            if (logoutBtn) logoutBtn.style.display = "none";
        }

        // Informujemy formularz recenzji filmu o zmianie statusu sesji
        if (typeof window.setupCommentFormAuth === 'function') {
            window.setupCommentFormAuth();
        }
    }

    updateUI();

    // ==========================================
    // OBSŁUGA PODGLĄDU HASŁA (OKO 👁️)
    // ==========================================
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            if (passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    this.textContent = '🙈';
                } else {
                    passwordInput.type = 'password';
                    this.textContent = '👁️';
                }
            }
        });
    });

    // ==========================================
    // REJESTRACJA (Login, Email, Hasło, Powtórz)
    // ==========================================
    const regForm = document.getElementById('registerForm');

    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const user = document.getElementById('regUser').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const pass = document.getElementById('regPass').value;
            const passConfirm = document.getElementById('regPassConfirm').value;
            const msg = document.getElementById('register-message');

            // 1. Sprawdzenie zgodności haseł
            if (pass !== passConfirm) {
                msg.textContent = "Hasła nie są identyczne!";
                msg.style.color = "red";
                return;
            }

            let users = getUsers();

            // 2. Sprawdzenie unikalności loginu i emaila
            if (users.find(u => u.username.toLowerCase() === user.toLowerCase())) {
                msg.textContent = "Użytkownik o takim loginie już istnieje!";
                msg.style.color = "red";
                return;
            }

            if (users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
                msg.textContent = "Ten adres e-mail jest już zajęty!";
                msg.style.color = "red";
                return;
            }

            // 3. Zapis nowego użytkownika z pustą tablicą komentarzy
            users.push({
                username: user,
                email: email,
                password: pass,
                comments: []
            });

            saveUsers(users);

            msg.textContent = "Konto utworzone pomyślnie!";
            msg.style.color = "lime";
            regForm.reset();
        });
    }

    // ==========================================
    // LOGOWANIE
    // ==========================================
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const user = document.getElementById('loginUser').value.trim();
            const pass = document.getElementById('loginPass').value;
            const msg = document.getElementById('login-message');

            let users = getUsers();

            const foundUser = users.find(
                u => u.username.toLowerCase() === user.toLowerCase() && u.password === pass
            );

            if (foundUser) {
                localStorage.setItem('currentUser', foundUser.username);

                msg.textContent = `Witaj ${foundUser.username}!`;
                msg.style.color = "lime";

                updateUI();
                
                // Odświeżenie sekcji komentarzy na profilu
                if (typeof window.loadUserComments === 'function') {
                    window.loadUserComments();
                }

                loginForm.reset();
            } else {
                msg.textContent = "Błędne dane logowania.";
                msg.style.color = "red";
            }
        });
    }

    // ==========================================
    // WYLOGOWANIE
    // ==========================================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            updateUI();
            
            if (typeof window.loadUserComments === 'function') {
                window.loadUserComments();
            }
        });
    }
});
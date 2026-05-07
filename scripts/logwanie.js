// Logika logowania i rejestracji dla KultuFilms

function getUsers() {
    const users = localStorage.getItem('kf_users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('kf_users', JSON.stringify(users));
}

document.addEventListener('DOMContentLoaded', () => {
    
    // OBSŁUGA REJESTRACJI
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

            users.push({ username: user, password: pass });
            saveUsers(users);
            msg.textContent = "Konto utworzone! Możesz się teraz zalogować.";
            msg.style.color = "green";
            regForm.reset();
        });
    }

    // OBSŁUGA LOGOWANIA
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('loginUser').value.trim();
            const pass = document.getElementById('loginPass').value;
            const msg = document.getElementById('login-message');

            let users = getUsers();
            const foundUser = users.find(u => u.username === user && u.password === pass);

            if (foundUser) {
                msg.textContent = `Witaj ponownie, ${user}!`;
                msg.style.color = "green";
                // Tutaj możesz dodać np. zapisanie zalogowanego usera do sessionStorage
                localStorage.setItem('currentUser', user);
            } else {
                msg.textContent = "Błędne dane logowania.";
                msg.style.color = "red";
            }
        });
    }
});
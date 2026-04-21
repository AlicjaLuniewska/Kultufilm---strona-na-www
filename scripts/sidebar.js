const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');

/**
 * Sekcja: Obsługa zwijania i rozwijania paska bocznego (Sidebar Toggle).
 * Odpowiada za przełączanie widoczności bocznego menu oraz zmianę 
 * etykiety przycisku w zależności od aktualnego stanu (collapsed/expanded).
 * 1. Wykorzystuje metodę 'classList.toggle' do płynnej zmiany klas CSS.
 * 2. Aktualizuje tekst przycisku: skrócona litera 'K' dla wersji zwiniętej 
 * oraz pełna nazwa 'KultuFilms' dla wersji rozwiniętej.
 * @description Poprawia UX na mniejszych ekranach i pozwala użytkownikowi 
 * na maksymalizację przestrzeni roboczej z filmami (Punkt #22).
**/

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        toggleBtn.innerText = 'K';
    } else {
        toggleBtn.innerText = 'KultuFilms';
    }
});



const settingsBtn = document.getElementById('settings-btn');
const settingsDropdown = document.getElementById('settings-dropdown');

if (settingsBtn && settingsDropdown) {
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        settingsDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!settingsDropdown.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsDropdown.classList.remove('show');
        }
    });
}
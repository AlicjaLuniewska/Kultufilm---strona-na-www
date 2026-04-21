const API_KEY = '21a2233cb5bf25673f5fe6e0228737e6'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const navButtons = document.querySelectorAll('.nav-btn');
const viewSections = document.querySelectorAll('.view-section');

let aktualneStrony = {
    'discover': 1,
    'top-rated': 1
};

/**
 * Sekcja: Nawigacja i system przełączania widoków (SPA Router).
 * Odpowiada za dynamiczną zmianę widocznych sekcji bez przeładowania strony:
 * 1. Zarządza klasami '.active' dla poszczególnych kontenerów widoków.
 * 2. Realizuje leniwe ładowanie danych (Lazy Loading) – pobiera kategorie 
 * lub rankingi dopiero w momencie przejścia do danej zakładki.
 * 3. Poprawia UX poprzez automatyczne ustawienie fokusu na wyszukiwarce.
 * @description Mechanizm ten pozwala na płynną nawigację (Punkt #14) 
 * i optymalizuje zużycie zasobów API, nie pobierając wszystkich danych na starcie.
**/

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetViewName = btn.getAttribute('data-view');
        if (!targetViewName) return;

        const targetSection = document.getElementById(`view-${targetViewName}`);

        if (!targetSection) {
            console.error("Błąd: Nie znaleziono sekcji view-" + targetViewName);
            return; 
        }

        viewSections.forEach(sec => sec.classList.remove('active'));
        targetSection.classList.add('active');

        if (targetViewName === 'search') {
            document.getElementById('search-input').focus();
        } else if (targetViewName === 'categories') {
            loadCategories();
        } else if (targetViewName === 'best') {
            loadBestMovies(); 
        }
    });
});


/**
 * Sekcja: Inicjalizacja i cykliczne przełączanie motywów wizualnych.
 * 1. Przy starcie: Odczytuje zapisany motyw z LocalStorage (domyślnie 'dark') 
 * i aplikuje go bez wyświetlania powiadomienia.
 * 2. Przycisk przełączania: Implementuje logikę karuzelową (dark -> light -> hc) 
 * przy użyciu operatora modulo (%).
 * 3. Animacja: Dynamicznie zarządza klasą 'theme-transition', aby zapewnić 
 * płynne przejścia kolorów (Punkt #22 - Dopracowanie UX).
 * @description Wykorzystuje wymuszenie przerysowania (reflow) poprzez 
 * odczyt 'offsetHeight', aby przeglądarka poprawnie zarejestrowała start animacji.
**/

const themes = ['dark', 'light', 'hc']; 
let currentThemeIndex = 0;

const savedTheme = localStorage.getItem('theme') || 'dark';
currentThemeIndex = themes.indexOf(savedTheme);
applyTheme(savedTheme, false); 

const themeToggleBtn = document.getElementById('theme-toggle');

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const newTheme = themes[currentThemeIndex];

        document.body.classList.add('theme-transition');

        void document.body.offsetHeight; 
        
        applyTheme(newTheme, true);

        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 500);
    });
}

/**
 * Aktywuje wybrany motyw wizualny i zapisuje preferencje użytkownika.
 * Proces działania:
 * 1. Czyści aktualne klasy motywów z elementu body.
 * 2. Nakłada nową klasę CSS odpowiadającą wybranemu stylowi.
 * 3. Zapamiętuje wybór w LocalStorage, aby motyw przetrwał odświeżenie strony.
 * 4. Opcjonalnie wyświetla powiadomienie (toast) z polską nazwą motywu.
 * @param {string} themeName - Kod motywu ('light', 'hc' lub 'dark').
 * @param {boolean} showToast - Czy wyświetlić graficzne potwierdzenie zmiany.
 * @returns {void}
 * @description Realizuje punkt #23 (Dostępność - Wysoki Kontrast) 
 * oraz punkt #12 (Trwałość danych użytkownika).
**/

function applyTheme(themeName, showToast) {
    document.body.classList.remove('light-theme', 'high-contrast');
    
    let polishName = "Ciemny";

    if (themeName === 'light') {
        document.body.classList.add('light-theme');
        polishName = "Jasny";
    } else if (themeName === 'hc') {
        document.body.classList.add('high-contrast');
        polishName = "Wysoki Kontrast";
    }

    localStorage.setItem('theme', themeName);

    if (showToast) {
        displayToast("Zmieniono motyw na: " + polishName);
    }
}

/**
 * Wyświetla krótką informację tekstową (toast) w dolnej części ekranu.
 * Powiadomienie pojawia się z animacją i znika automatycznie po 2,5 sekundy.
 * @param {string} message - Treść komunikatu do wyświetlenia użytkownikowi.
 * @returns {void}
 * @description Funkcja zarządza klasą CSS '.show', która odpowiada za 
 * widoczność elementu. Wykorzystuje metodę 'setTimeout' do asynchronicznego 
 * ukrycia powiadomienia (Punkt #22 - UX i dopracowanie interfejsu).
**/

function displayToast(message) {
    const toast = document.getElementById('theme-toast');
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

/**
 * Sekcja: Zarządzanie dostępnością czcionki (Accessibility Font).
 * Pozwala użytkownikowi na zmianę artystycznej czcionki na standardową, 
 * bardziej czytelną (Punkt #25 - Dostępność).
**/
const fontToggleBtn = document.getElementById('font-toggle');

if (localStorage.getItem('accessible-font') === 'true') {
    document.body.classList.add('accessible-font');
}

if (fontToggleBtn) {
    fontToggleBtn.addEventListener('click', () => {
        const isAccessible = document.body.classList.toggle('accessible-font');
        localStorage.setItem('accessible-font', isAccessible);
        
        displayToast(isAccessible ? "Włączono czytelną czcionkę" : "Przywrócono czcionkę stylową");
    });
}
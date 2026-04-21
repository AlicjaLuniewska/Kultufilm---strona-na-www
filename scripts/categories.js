const catButtonsBox = document.getElementById('category-buttons');
const catResults = document.getElementById('category-results');
const catTitle = document.getElementById('category-title');
let categoriesLoaded = false;

/**
 * Inicjalizuje widok kategorii poprzez pobranie listy gatunków z API.
 * Tworzy przyciski nawigacyjne i przypisuje im zdarzenia kliknięcia.
 * @async
 * @returns {Promise<void>} Obietnica zakończenia renderowania przycisków kategorii.
 * @throws {Error} Wyrzuca błąd w przypadku problemów z połączeniem lub odpowiedzią API.
 * @description Wykorzystuje flagę 'categoriesLoaded', aby uniknąć zbędnych zapytań 
 * przy wielokrotnym wchodzeniu w widok kategorii.
 */

async function loadCategories() {
    if (categoriesLoaded) return; 
    
    try {
        const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pl-PL`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Nie udało się pobrać listy kategorii.");
        
        const data = await response.json();

        catButtonsBox.innerHTML = data.genres.map(genre => 
            `<button class="cat-btn" data-id="${genre.id}">${genre.name}</button>`
        ).join('');

        categoriesLoaded = true;

        const buttons = document.querySelectorAll('.cat-btn');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', handleCategoryClick);
        }

    } catch (error) {
        console.error("Błąd kategorii:", error);
        catButtonsBox.innerHTML = `<p class="error-message">Błąd ładowania kategorii.</p>`;
    }
}

/**
 * Obsługuje kliknięcie w przycisk kategorii (Event Handler).
 * Zarządza podświetleniem aktywnego przycisku oraz pobiera filmy z danej kategorii.
 * @async
 * @param {Event} event - Obiekt zdarzenia kliknięcia myszką.
 * @returns {Promise<void>} Obietnica zakończenia renderowania wyników dla wybranej kategorii.
 * @description Wykorzystuje atrybut 'data-id' z elementu docelowego (target) 
 * do przefiltrowania zapytania API /discover/movie.
**/

async function handleCategoryClick(event) {
    const allButtons = document.querySelectorAll('.cat-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }
    event.target.classList.add('active');
    const genreId = event.target.getAttribute('data-id');

    catResults.innerHTML = '<p class="loading-text">Ładowanie filmów...</p>';

    try {
        const moviesUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pl-PL&with_genres=${genreId}`;
        const res = await fetch(moviesUrl);
        
        if (!res.ok) throw new Error("Błąd pobierania filmów z kategorii.");
        
        const data = await res.json();

        if (data.results.length > 0) {
            catResults.innerHTML = data.results.map(movie => createMovieCard(movie)).join('');
        } else {
            catResults.innerHTML = '<p class="error-message">Nie znaleziono filmów w tej kategorii.</p>';
        }

    } catch (error) {
        console.error("Błąd ładowania filmów kategorii:", error);
        catResults.innerHTML = '<p class="error-message">Wystąpił problem przy pobieraniu filmów. Spróbuj ponownie.</p>';
    }
}
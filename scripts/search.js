const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
let searchTimeout;

/**
 * Sekcja: Obsługa wyszukiwarki filmów w czasie rzeczywistym (Live Search).
 * Implementuje mechanizm Debouncing (opóźnienie 500ms), aby ograniczyć 
 * liczbę zapytań do API podczas pisania. 
 * 1. Czyści poprzedni licznik (clearTimeout) przy każdym naciśnięciu klawisza.
 * 2. Waliduje długość frazy (minimum 2 znaki).
 * 3. Pobiera wyniki wyszukiwania asynchronicznie i renderuje je przy użyciu 'createMovieCard'.
 * @param {Event} event - Obiekt zdarzenia wprowadzania tekstu (input).
 * @description Zapobiega wysyłaniu zbędnych żądań sieciowych, co znacząco 
 * poprawia wydajność aplikacji i oszczędza limity klucza API (Punkt #15).
**/

searchInput.addEventListener('input', (event) => {
    const haslo = event.target.value.trim();
    clearTimeout(searchTimeout);

    if (haslo.length < 2) {
        searchResults.innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            let url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pl-PL&query=${haslo}`;
            let odpowiedz = await fetch(url);
            let dane = await odpowiedz.json();
            
            if (dane.results.length === 0) {
                searchResults.innerHTML = '<p>Nie znaleziono filmów.</p>';
                return;
            }
            

            searchResults.innerHTML = dane.results.map(createMovieCard).join('');
        } catch (error) {
            console.error(error);
        }
    }, 500); 
});
const detailsOverlay = document.getElementById('movie-details');
const detailsBody = document.getElementById('details-body');
const closedetailsBtn = document.getElementById('close-modal'); 

/**
 * Otwiera modal z pełnymi szczegółami filmu i zarządza jego zawartością.
 * Proces działania:
 * 1. Aktywuje warstwę overlay i wyświetla placeholder ładowania.
 * 2. Pobiera szczegółowe metadane filmu z endpointu /movie/{id}.
 * 3. Formatuje dane (czas trwania, gatunki, oceny) i wstrzykuje strukturę HTML.
 * 4. Inicjalizuje podrzędne moduły: listę komentarzy oraz sekcję rekomendacji.
 * @async
 * @param {number|string} id - Unikalny identyfikator filmu w bazie TMDB.
 * @returns {Promise<void>} Obietnica zakończenia renderowania pełnego widoku szczegółów.
 * @throws {Error} Wyrzuca błąd w przypadku niepowodzenia zapytania fetch.
 * @description Funkcja wykorzystuje 'window.currentOpenMovieId' do synchronizacji 
 * stanu aplikacji z formularzem komentarzy (Punkt #19 i #21).
**/

async function openDetails(id) { 
    window.currentOpenMovieId = id;
    detailsOverlay.classList.add('active');
    detailsBody.innerHTML = '<p class="loading-msg">Ładowanie szczegółów...</p>';

    try {
        const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=pl-PL`;
        const odpowiedz = await fetch(url);
        
        if (!odpowiedz.ok) throw new Error("Błąd pobierania szczegółów");
        
        const film = await odpowiedz.json();

        const poster = film.poster_path ? IMG_BASE_URL + film.poster_path : './assets/placeholder.png';
        const gatunki = film.genres ? film.genres.map(g => g.name).join(', ') : 'Brak danych';
        const czas = film.runtime ? film.runtime + ' min' : 'Nieznany czas';
        const rok = film.release_date ? film.release_date.substring(0, 4) : 'Brak';
        const ocena = film.vote_average ? film.vote_average.toFixed(1) : 'Brak';

        const icons = {
            calendar: `<svg fill="currentColor" height="18" width="18" viewBox="0 0 24 24"><path d="M21,5V4h-4V3h-2v1H9V3H7v1H3v1H2v16h1v1h18v-1h1V5H21z M20,9H4V7h1V6h2v2h2V6h6v2h2V6h2v1h1V9z M20,19h-1v1H5v-1H4v-8h16V19 z"></path></svg>`,
            clock: `<svg fill="currentColor" height="18" width="18" viewBox="0 0 24 24"><polygon points="13,11 13,6 11,6 11,13 16,13 16,11"></polygon><path d="M21,5V4h-1V3h-1V2H5v1H4v1H3v1H2v14h1v1h1v1h1v1h14v-1h1v-1h1v-1h1V5H21z M20,17h-1v1h-1v1h-1v1H7v-1H6v-1H5v-1H4V7h1V6h1 V5h1V4h10v1h1v1h1v1h1V17z"></path></svg>`,
            star: `<svg fill="currentColor" height="18" width="18" viewBox="0 0 24 24"><path d="M16,9V8h-1V6h-1V4h-1V2h-2v2h-1v2H9v2H8v1H2v2h1v1h1v1h1v1h1v4H5v2H4v2h3v-1h2v-1h1v-1h4v1h1v1h2v1h3v-2h-1v-2h-1v-4h1v-1h1 v-1h1v-1h1V9H16z M16,12v1h-1v2h1v2h-2v-1h-4v1H8v-2h1v-2H8v-1H7v-1h3v-1h1V8h2v2h1v1h3v1H16z"/></svg>`
        };

        detailsBody.innerHTML = `
            <div class="details-main-info">
                <img src="${poster}" class="details-poster" alt="${film.title}">
                <div class="details-info">
                    <h2 class="details-title">${film.title}</h2>
                    <div class="details-meta">
                        ${icons.calendar} &nbsp;${rok}&nbsp;&nbsp;
                        ${icons.clock} &nbsp;${czas}&nbsp;&nbsp;
                        ${icons.star} &nbsp;${ocena}
                    </div>
                    <p class="details-genres">${gatunki}</p>
                    <p class="details-overview">${film.overview || 'Ten film nie posiada jeszcze opisu.'}</p>
                </div>
            </div>
            
            <div class="details-bottom-grid">
                <div class="comments-section">
                    <h3>Komentarze</h3>
                    <div id="comments-list"></div>
                    <form id="comment-form">
                        <div class="form-row">
                            <input type="text" id="comment-user" placeholder="Twoja nazwa..." required>
                            <button type="submit">Dodaj</button>
                        </div>
                        <textarea id="comment-text" placeholder="Dodaj opinię o filmie..." required></textarea>
                        <div id="char-count" style="font-size: 12px; color: gray;">Znaki: 0/10</div>
                    </form>
                </div>

                <div class="recommendations-section">
                    <h3>Podobne filmy</h3>
                    <div id="recommendations-list">
                        <p class="small-loading">Ładowanie rekomendacji...</p>
                    </div>
                </div>
            </div>
        `;

        loadComments(id);
        fetchRecommendations(id);

    } catch (error) {
        console.error("Błąd modalu:", error);
        detailsBody.innerHTML = '<p class="error-msg">Przepraszamy, nie udało się pobrać szczegółowych danych o filmie.</p>';
    }
}

/**
 * Pobiera i wyświetla listę rekomendowanych filmów (podobnych) dla danego tytułu.
 * @async
 * @param {number|string} id - Unikalny identyfikator filmu bazowego (TMDB ID).
 * @returns {Promise<void>} Obietnica zakończenia renderowania sekcji rekomendacji.
 * @description Funkcja ogranicza wyświetlanie do 6 pierwszych wyników (slice), 
 * zapewniając czytelność interfejsu (UX). Każdy element jest interaktywny 
 * i pozwala na przejście do szczegółów kolejnego filmu (rekurencja interfejsu).
**/
async function fetchRecommendations(id) {
    const recList = document.getElementById('recommendations-list');
    if (!recList) return;

    try {
        const url = `${BASE_URL}/movie/${id}/recommendations?api_key=${API_KEY}&language=pl-PL`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error("Błąd pobierania rekomendacji");
        
        const data = await res.json();
        const movies = data.results.slice(0, 6);

        if (movies.length === 0) {
            recList.innerHTML = '<p class="no-data-msg">Brak podobnych filmów w bazie.</p>';
            return;
        }

        recList.innerHTML = movies.map(movie => {
            const poster = movie.poster_path ? IMG_BASE_URL + movie.poster_path : './assets/placeholder.png';
            
            return `
                <div class="rec-item" onclick="openDetails(${movie.id})" title="${movie.title}">
                    <img src="${poster}" alt="${movie.title}">
                </div>
            `;
        }).join('');
        
    } catch (err) {
        console.error("Rekomendacje błąd:", err);
        recList.innerHTML = '<p class="error-small">Nie udało się załadować podobnych filmów.</p>';
    }
}


/**
 * Sekcja: Obsługa zamykania modalu szczegółów (Modal Close Handlers).
 * * Zapewnia trzy niezależne sposoby wyjścia z widoku szczegółów (UX/Accessibility):
 * 1. Kliknięcie w dedykowany przycisk zamknięcia (X).
 * 2. Kliknięcie w ciemne tło (overlay) poza obszarem treści modalu.
 * 3. Naciśnięcie klawisza 'Escape' na klawiaturze (Punkt #23 - Dostępność).
 * * @description Wykorzystuje manipulację klasami CSS (.remove('active')) 
 * do ukrycia elementu w drzewie DOM.
**/

closedetailsBtn.addEventListener('click', () => {
    detailsOverlay.classList.remove('active');
});

detailsOverlay.addEventListener('click', (event) => {
    if (event.target === detailsOverlay) {
        detailsOverlay.classList.remove('active');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && detailsOverlay.classList.contains('active')) {
        detailsOverlay.classList.remove('active');
    }
});

/**
 * Pobiera komentarze z pamięci przeglądarki i renderuje je w bezpieczny sposób.
 * Proces działania:
 * 1. Odczytuje dane z LocalStorage i parsuje je z formatu JSON.
 * 2. Filtruje komentarze, aby wyświetlić tylko te przypisane do danego filmu.
 * 3. Tworzy elementy DOM i używa .textContent, aby zapobiec atakom XSS.
 * @param {string|number} movieId - Unikalny identyfikator filmu, będący kluczem w bazie komentarzy.
 * @returns {void}
 * @description Funkcja realizuje punkt #12 (LocalStorage) oraz punkt #20 (Bezpieczeństwo danych).
**/

function loadComments(movieId) {
    const list = document.getElementById('comments-list');
    if (!list) return;

    list.innerHTML = '';

    const store = localStorage.getItem('movie_comments');
    const allComments = JSON.parse(store) || {};
    
    const movieComments = allComments[movieId] || [];

    if (movieComments.length === 0) {
        list.innerHTML = '<p class="no-comments">Brak komentarzy. Bądź pierwszy!</p>';
        return;
    }

    for (let i = 0; i < movieComments.length; i++) {
        const c = movieComments[i];
        
        const div = document.createElement('div');
        div.className = 'comment-item';

        div.innerHTML = `<strong></strong><p></p>`;
        div.querySelector('strong').textContent = c.user;
        div.querySelector('p').textContent = c.text;

        list.appendChild(div);
    }
}

/**
 * Globalny słuchacz zdarzenia 'submit' obsługujący formularz komentarzy.
 * Realizuje proces zapisu opinii w pamięci LocalStorage:
 * 1. Blokuje domyślne przeładowanie strony (e.preventDefault).
 * 2. Pobiera aktualne ID filmu i dane z pól formularza.
 * 3. Serializuje dane do formatu JSON i zapisuje je w magazynie przeglądarki.
 * 4. Odświeża widok listy komentarzy i resetuje pola formularza.
 * @param {Event} e - Obiekt zdarzenia wysłania formularza.
 * @returns {void}
 * @description Wykorzystuje metodę 'unshift', aby najnowsze komentarze 
 * trafiały na szczyt listy (Punkt #12 - LocalStorage).
**/

document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'comment-form') {
        e.preventDefault();

        const movieId = window.currentOpenMovieId;
        const userInput = document.getElementById('comment-user');
        const textInput = document.getElementById('comment-text');

        const allComments = JSON.parse(localStorage.getItem('movie_comments')) || {};
        if (!allComments[movieId]) allComments[movieId] = [];

        allComments[movieId].unshift({
            user: userInput.value,
            text: textInput.value
        });

        localStorage.setItem('movie_comments', JSON.stringify(allComments));
        
        loadComments(movieId); 
        e.target.reset(); 
    }
});
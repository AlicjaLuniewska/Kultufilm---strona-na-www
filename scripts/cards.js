/**
 * Generuje kod HTML dla pojedynczej karty filmu na podstawie danych z obiektu movie.
 * Przygotowuje ścieżki do zdjęć, formatuje daty oraz czyści teksty przed wstrzyknięciem do DOM.
 * @param {Object} movie - Obiekt z danymi filmu pobrany z API TMDB.
 * @param {number} movie.id - Unikalny identyfikator filmu.
 * @param {string} movie.title - Oryginalny lub przetłumaczony tytuł filmu.
 * @param {string} [movie.poster_path] - Relatywna ścieżka do plakatu.
 * @param {string} [movie.release_date] - Data premiery w formacie RRRR-MM-DD.
 * @param {number} [movie.vote_average] - Średnia ocena filmu.
 * @param {string} [movie.overview] - Krótki opis fabuły.
 * @param {string} [movie.backdrop_path] - Ścieżka do szerokiej grafiki tła (używana przy onmouseenter).
 * @returns {string} Ciąg znaków zawierający strukturę HTML karty filmu.
**/

function createMovieCard(movie) {
    const defaultPoster = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1920px-No-Image-Placeholder.svg.png';

    let posterPath = defaultPoster;
    if (movie.poster_path && movie.poster_path !== 'null') {
        posterPath = IMG_BASE_URL + movie.poster_path;
    }

    let releaseYear = "Brak danych";
    if (movie.release_date && movie.release_date.length >= 4) {
        releaseYear = movie.release_date.substring(0, 4);
    }

    let movieRating = "0.0";
    if (movie.vote_average) {
        movieRating = movie.vote_average.toFixed(1);
    }

    const cleanText = (text) => {
        if (!text) return "";
        return text.replace(/"/g, '&quot;').replace(/'/g, '’').replace(/\n/g, ' ');
    };

    const safeTitle = cleanText(movie.title);
    const safeOverview = cleanText(movie.overview || "Brak opisu.");
    const starSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16,9V8h-1V6h-1V4h-1V2h-2v2h-1v2H9v2H8v1H2v2h1v1h1v1h1v1h1v4H5v2H4v2h3v-1h2v-1h1v-1h4v1h1v1h2v1h3v-2h-1v-2h-1v-4h1v-1h1 v-1h1v-1h1V9H16z M16,12v1h-1v2h1v2h-2v-1h-4v1H8v-2h1v-2H8v-1H7v-1h3v-1h1V8h2v2h1v1h3v1H16z"/></svg>`;

    return `
        <div class="card" 
             onmouseenter="updateBanner('${safeTitle}', '${safeOverview}', '${releaseYear}', '${movieRating}', '${movie.backdrop_path}')" 
             onclick="openDetails(${movie.id})">
            
            <img src="${posterPath}" 
                 onerror="this.src='${defaultPoster}';" 
                 alt="${safeTitle}" 
                 class="card-img">
            
            <div class="card-info">
                <p class="card-title">${movie.title}</p>
                <p class="card-meta">
                    ${releaseYear} &nbsp;&nbsp; ${starSvg} &nbsp;${movieRating}
                </p>
            </div>
        </div>
    `;
}

/**
 * Główny silnik pobierający i renderujący filmy z API TMDB.
 * Funkcja odpowiada za fetchowanie danych, aktualizację bannera (przy pierwszej stronie)
 * oraz dynamiczne budowanie siatki filmów z obsługą przycisku "Wczytaj więcej".
 * @async
 * @param {string} endpoint - Ścieżka zasobu API (np. '/movie/popular').
 * @param {string} containerId - ID elementu HTML, w którym zostaną wyświetlone filmy.
 * @param {number} [page=1] - Numer strony do pobrania z API (domyślnie 1).
 * @param {boolean} [isAppending=false] - Flaga określająca, czy filmy mają być dopisane (true), czy zastąpić obecną treść (false).
 * @returns {Promise<void>} Obietnica zakończenia procesu renderowania.
**/

async function loadMovies(endpoint, containerId, page = 1, isAppending = false) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error("Nie znaleziono kontenera: " + containerId);
        return; 
    }

    try {
        const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=pl-PL&page=${page}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Błąd sieci lub nieprawidłowy endpoint");
        
        const data = await response.json();
        const movies = data.results;

        if (containerId === 'discover' && page === 1 && isAppending === false) {
            if (movies.length > 0) {
                
                let pierwszyFilm = movies[0];

                let rok = "Brak";
                if (pierwszyFilm.release_date) {
                    rok = pierwszyFilm.release_date.substring(0, 4);
                }

                let ocena = "0.0";
                if (pierwszyFilm.vote_average) {
                    ocena = pierwszyFilm.vote_average.toFixed(1);
                }

                let tytul = pierwszyFilm.title;
                tytul = tytul.replaceAll('"', '&quot;'); 
                tytul = tytul.replaceAll("'", "’");

                let opis = pierwszyFilm.overview;
                if (opis) {
                    opis = opis.replaceAll('"', '&quot;');
                    opis = opis.replaceAll("'", "’");
                } else {
                    opis = "Brak opisu.";
                }

                updateBanner(tytul, opis, rok, ocena, pierwszyFilm.backdrop_path);
            }
        }

        let moviesHtml = movies.map(m => createMovieCard(m)).join('');

        const loadMoreBtn = `
            <div class="card load-more-card" onclick="loadMore('${endpoint}', '${containerId}')">
                <div class="plus-icon">+</div>
                <p>Wczytaj więcej</p>
            </div>
        `;

        if (isAppending === true) {
            const staryPrzycisk = container.querySelector('.load-more-card');
    
            if (staryPrzycisk) {
                staryPrzycisk.remove();
            }
            
            container.insertAdjacentHTML('beforeend', moviesHtml + loadMoreBtn);

        } 
        else {
            container.innerHTML = moviesHtml + loadMoreBtn;
        }
        
    } catch (error) {
        console.error("Problem z ładowaniem filmów:", error);
        container.innerHTML = `<p class="error-message">Przepraszamy, nie udało się wczytać filmów. Sprawdź połączenie z internetem.</p>`;
    }
}

loadMovies('/movie/popular', 'discover');
loadMovies('/movie/top_rated', 'top-rated');

/**
 * Obsługuje żądanie wczytania kolejnej porcji filmów (paginacja).
 * Zwiększa licznik stron dla danego kontenera i wywołuje funkcję pobierającą dane.
 * @param {string} endpoint - Ścieżka API TMDB (np. '/movie/popular').
 * @param {string} ID - Unikalny identyfikator kontenera (klucz w obiekcie aktualneStrony).
 * @returns {void}
**/

function loadMore(endpoint, ID) {
    aktualneStrony[ID]++; 
    loadMovies(endpoint, ID, aktualneStrony[ID], true); 
}

/**
 * Przesuwa zawartość karuzeli o określoną liczbę pikseli w poziomie.
 * @param {string} containerId - ID elementu HTML (kontenera), który ma zostać przewinięty.
 * @param {number} dystans - Liczba pikseli do przesunięcia (wartość dodatnia w prawo, ujemna w lewo).
 * @returns {void}
**/
function scrollCarousel(containerId, dystans) {
    let pojemnik = document.getElementById(containerId);
    if (pojemnik) {
        pojemnik.scrollBy({
            left: dystans,
            behavior: 'smooth'
        });
    }
}


/**
 * Sekcja: Obsługa poziomego przewijania karuzeli kółkiem myszy.
 * Pobiera wszystkie kontenery kart filmowych i przypisuje im zdarzenie 'wheel'.
 * Dzięki temu kręcenie kółkiem myszy w pionie przesuwa karuzelę w poziomie (UX).
**/
const wszystkieKaruzele = document.querySelectorAll('.movie-card-container');
for (let i = 0; i < wszystkieKaruzele.length; i++) {
    const karuzela = wszystkieKaruzele[i];

    karuzela.addEventListener('wheel', function(event) {
        event.preventDefault(); 
        karuzela.scrollBy({
            left: event.deltaY * 5
        });
    });
}
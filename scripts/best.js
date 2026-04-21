let bestMoviesLoaded = false;
/**
 * Pobiera asynchronicznie dane o najlepiej ocenianych filmach (Top Rated).
 * Wykonuje kilka zapytań jednocześnie, łączy wyniki i rozdziela je na sekcje rankingu.
 * @async
 * @returns {Promise<void>} Obietnica zakończenia procesu ładowania i renderowania.
 * @throws {Error} Wyrzuca błąd, gdy którekolwiek z zapytań fetch zakończy się niepowodzeniem.
**/

async function loadBestMovies() {
    if (bestMoviesLoaded) return;

    const containerIds = [
        'top10-results', 
        'top20-results', 
        'top30-results', 
        'top40-results', 
        'top50-results'
    ];

    try {
        const pages = [1, 2, 3];

        const requests = pages.map(pageNr => 
            fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=pl-PL&page=${pageNr}`)
            .then(res => {
                if (!res.ok) throw new Error(`Błąd pobierania strony ${pageNr}`);
                return res.json();
            })
        );

        const responses = await Promise.all(requests);
        const allMovies = responses.flatMap(data => data.results);

        containerIds.forEach((id, i) => {
            const start = i * 10;
            const end = start + 10;
            renderBestSection(id, allMovies.slice(start, end), start);
        });

        bestMoviesLoaded = true;

    } catch (error) {
        console.error("Błąd podczas ładowania rankingu:", error);
        
        containerIds.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `<p class="error-message">Nie udało się załadować rankingu. Spróbuj później.</p>`;
            }
        });
    }
}

/**
 * Renderuje sekcję rankingu (np. TOP 10) z automatyczną numeracją pozycji.
 * Tworzy kopie obiektów filmów z dopisanym numerem miejsca przed tytułem.
 * @param {string} containerId - ID elementu HTML, do którego trafią karty filmów.
 * @param {Object[]} moviesList - Tablica obiektów z danymi filmów pobranych z API.
 * @param {number} startIndex - Numer początkowy dla listy (używany do poprawnej numeracji pozycji).
 * @returns {void}
**/

function renderBestSection(containerId, moviesList, startIndex) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let htmlContent = "";

    for (let i = 0; i < moviesList.length; i++) {
        const movie = moviesList[i];
        const position = startIndex + i + 1;
        const movieWithRank = {
            id: movie.id,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            title: position + ". " + movie.title 
        };
        htmlContent += createMovieCard(movieWithRank);
    }
    container.innerHTML = htmlContent;
}
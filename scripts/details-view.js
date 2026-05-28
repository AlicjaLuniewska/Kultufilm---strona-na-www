/**
 * details-view.js
 * Zarządzanie oknem modalnym szczegółów filmu, dynamicznym pobieraniem danych z TMDB oraz komentarzami.
 * Wersja z naprawionymi marginesami wewnętrznymi (padding) dla treści opinii.
 */

const detailsOverlay = document.getElementById('movie-details');
const detailsBody = document.getElementById('details-body');
const closedetailsBtn = document.getElementById('close-modal'); 

// Zmienne stanu - aktualizują się dynamicznie przy otwarciu każdego filmu
let currentMovieId = ""; 
let currentMovieTitle = ""; 

/**
 * Główna funkcja wywoływana przez kliknięcie karty filmu (zgodnie z cards.js)
 * Pobiera dane o filmie z TMDB i otwiera okno modalne.
 * @async
 * @param {number|string} id - Unikalny identyfikator filmu z TMDB
 */
async function openDetails(id) {
    currentMovieId = id;

    // 1. Otwieramy okno i pokazujemy tekst ładowania
    if (detailsOverlay) {
        detailsOverlay.style.display = 'flex';
        detailsOverlay.classList.add('active');
    }
    if (detailsBody) {
        detailsBody.innerHTML = '<p style="padding: 40px; text-align: center; color: #fff;">Wczytywanie szczegółów filmu...</p>';
    }

    try {
        const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=pl-PL`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Nie udało się pobrać szczegółów filmu.");
        
        const movie = await response.json();
        currentMovieTitle = movie.title; // Zapisujemy czysty tytuł do komentarza na profilu

        const defaultPoster = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1920px-No-Image-Placeholder.svg.png';
        const posterPath = movie.poster_path ? (IMG_BASE_URL + movie.poster_path) : defaultPoster;
        const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : "Brak danych";
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "0.0";
        const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : "Brak danych";
        const overview = movie.overview || "Brak opisu fabuły w języku polskim.";

        if (detailsBody) {
            detailsBody.innerHTML = `
                <div class="movie-details-layout" style="display: flex; flex-direction: column; gap: 20px; color: #fff; padding: 10px 20px;">
                    <div class="movie-main-info" style="display: flex; gap: 25px; flex-wrap: wrap;">
                        <img src="${posterPath}" alt="${movie.title}" style="width: 200px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); object-fit: cover;">
                        <div style="flex: 1; min-width: 280px;">
                            <h1 style="font-size: 32px; margin: 0 0 10px 0; font-family: inherit;">${movie.title}</h1>
                            <p style="margin: 5px 0; opacity: 0.6;"><strong>Rok wydania:</strong> ${releaseYear}</p>
                            <p style="margin: 5px 0; color: #ffbc0b; display: flex; align-items: center; gap: 5px;">
                                <strong>Ocena:</strong> ⭐ ${rating} / 10
                            </p>
                            <p style="margin: 5px 0; opacity: 0.8;"><strong>Gatunki:</strong> ${genres}</p>
                            <p style="margin: 15px 0 0 0; line-height: 1.6; font-size: 15px; color: #ddd;">${overview}</p>
                        </div>
                    </div>
                    
                    <hr style="margin: 30px 0 20px 0; border: 0; border-top: 1px solid #222;">
                    
                    <div class="comments-section" style="display: flex; flex-direction: column; gap: 15px;">
                        <h3 style="font-size: 22px; margin: 0 0 5px 0; color: #ffbc0b;">Opinie społeczności</h3>
                        
                        <div id="comments-list" style="display: flex; flex-direction: column; gap: 12px; max-height: 300px; overflow-y: auto; padding-right: 5px;"></div>
                        
                        <form id="comment-form" style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                            <input type="text" id="comment-user" class="search-input" placeholder="Nazwa użytkownika" required style="width: 100%; padding: 12px 15px;">
                            <textarea id="comment-text" class="search-input" rows="3" placeholder="Co sądzisz o tym filmie? Dodaj swoją opinię..." required style="resize: vertical; font-family: inherit; width: 100%; padding: 12px 15px; min-height: 80px;"></textarea>
                            <button type="submit" class="auth-submit-btn" style="align-self: flex-start; min-width: 160px; padding: 12px 20px; font-weight: bold;">Dodaj komentarz</button>
                        </form>
                    </div>
                </div>
            `;
        }

        window.setupCommentFormAuth();
        renderMovieComments(currentMovieId);
        rebindCommentFormSubmit();

    } catch (error) {
        console.error("Błąd ładowania szczegółów modala:", error);
        if (detailsBody) {
            detailsBody.innerHTML = '<p style="padding: 40px; text-align: center; color: #e50914;">Nie udało się załadować danych tego filmu. Spróbuj ponownie później.</p>';
        }
    }
}

// Udostępniamy funkcję globalnie dla cards.js
window.openDetails = openDetails;

/**
 * Zamyka okno modalne szczegółów filmu
 */
function closeMovieDetails() {
    if (detailsOverlay) {
        detailsOverlay.classList.remove('active');
        detailsOverlay.style.display = 'none';
    }
}

// Obsługa przycisku zamknięcia X
if (closedetailsBtn) {
    closedetailsBtn.addEventListener('click', closeMovieDetails);
}

// Zamknięcie po kliknięciu w tło poza okno modalne
if (detailsOverlay) {
    detailsOverlay.addEventListener('click', (e) => {
        if (e.target === detailsOverlay) {
            closeMovieDetails();
        }
    });
}

/**
 * Funkcja zarządzająca uprawnieniami formularza komentarzy pod filmem
 */
window.setupCommentFormAuth = function() {
    const commentUserInput = document.getElementById('comment-user');
    const commentTextArea = document.getElementById('comment-text');
    const commentButton = document.querySelector('#comment-form button');
    const currentUser = localStorage.getItem('currentUser');

    if (!commentUserInput) return;

    if (currentUser) {
        commentUserInput.value = currentUser;
        commentUserInput.readOnly = true;
        commentUserInput.style.opacity = "0.7";
        commentUserInput.style.cursor = "not-allowed";
        
        if (commentTextArea) commentTextArea.disabled = false;
        if (commentButton) {
            commentButton.disabled = false;
            commentButton.textContent = "Dodaj komentarz";
            commentButton.style.background = "#e50914";
            commentButton.style.cursor = "pointer";
        }
    } else {
        commentUserInput.value = "";
        commentUserInput.placeholder = "Musisz się zalogować";
        commentUserInput.readOnly = true;
        commentUserInput.style.opacity = "1";
        commentUserInput.style.cursor = "inherit";
        
        if (commentTextArea) {
            commentTextArea.disabled = true;
            commentTextArea.placeholder = "Zaloguj się na swoje konto, aby móc dodawać opinie o filmach.";
        }
        if (commentButton) {
            commentButton.disabled = true;
            commentButton.textContent = "Zaloguj się aby napisać";
            commentButton.style.background = "#555";
            commentButton.style.cursor = "not-allowed";
        }
    }
};

/**
 * Wyświetlanie listy opinii pod wybranym filmem (Z poprawionym odstępem od krawędzi)
 */
function renderMovieComments(movieId) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    commentsList.innerHTML = '';
    const allGlobalComments = JSON.parse(localStorage.getItem('kf_global_comments')) || {};
    const movieComments = allGlobalComments[movieId] || [];

    if (movieComments.length === 0) {
        commentsList.innerHTML = '<p style="color: #888; font-size: 14px; padding: 15px 5px; opacity: 0.7;">Brak komentarzy. Bądź pierwszą osobą, która oceni ten film!</p>';
        return;
    }

    movieComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        // KLUCZOWA POPRAWKA: solidny padding wewnątrz ramki odsuwający tekst od krawędzi
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        div.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        div.style.borderRadius = '8px';
        div.style.padding = '15px 25px'; 
        div.style.marginBottom = '4px';

        div.innerHTML = `
            <div class="comment-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; width: 100%;">
                <strong style="color: #ff4d4d; font-size: 15px; font-weight: 600;">${comment.author}</strong>
                <span class="comment-date" style="opacity: 0.5; font-size: 12px;">${comment.date}</span>
            </div>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #eee; text-align: left; width: 100%; word-break: break-word;">${comment.text}</p>
        `;
        commentsList.appendChild(div);
    });
}

/**
 * Podwiązuje zdarzenie wysyłania formularza komentarzy
 */
function rebindCommentFormSubmit() {
    const commentForm = document.getElementById('comment-form');
    if (!commentForm) return;

    commentForm.replaceWith(commentForm.cloneNode(true));
    const freshForm = document.getElementById('comment-form');
    
    freshForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentUser = localStorage.getItem('currentUser');
        const commentText = document.getElementById('comment-text').value.trim();

        if (!currentUser || !commentText || !currentMovieId) return;

        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const newComment = {
            movieId: currentMovieId,
            movieTitle: currentMovieTitle, 
            author: currentUser,
            text: commentText,
            date: formattedDate
        };

        // 1. Zapis globalny filmu
        let allGlobalComments = JSON.parse(localStorage.getItem('kf_global_comments')) || {};
        if (!allGlobalComments[currentMovieId]) allGlobalComments[currentMovieId] = [];
        allGlobalComments[currentMovieId].push(newComment);
        localStorage.setItem('kf_global_comments', JSON.stringify(allGlobalComments));

        // 2. Zapis w profilu użytkownika
        let users = JSON.parse(localStorage.getItem('kf_users')) || [];
        const userIndex = users.findIndex(u => u.username.toLowerCase() === currentUser.toLowerCase());
        
        if (userIndex !== -1) {
            if (!users[userIndex].comments) users[userIndex].comments = [];
            users[userIndex].comments.push(newComment);
            localStorage.setItem('kf_users', JSON.stringify(users));
        }

        // 3. Czyszczenie pola tekstowego i natychmiastowy update listy
        document.getElementById('comment-text').value = '';
        renderMovieComments(currentMovieId);
        
        if (typeof window.loadUserComments === 'function') {
            window.loadUserComments();
        }
    });
}

// Pierwsza inicjalizacja przy załadowaniu drzewa DOM
document.addEventListener('DOMContentLoaded', () => {
    window.setupCommentFormAuth();
    if (currentMovieId) {
        renderMovieComments(currentMovieId);
    }
});
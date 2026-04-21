/**
 * Pobiera i wyświetla listę komentarzy dla konkretnego filmu z pamięci przeglądarki.
 * Wykonuje czyszczenie kontenera, parsuje dane z formatu JSON oraz generuje 
 * elementy HTML dla każdego wpisu.
 * @param {string|number} movieId - Unikalny identyfikator filmu, służący jako klucz w bazie komentarzy.
 * @returns {void} Funkcja aktualizuje bezpośrednio element DOM #comments-list.
 * @description Wykorzystuje LocalStorage do trwałego przechowywania opinii użytkowników 
 * między sesjami przeglądarki (Punkt #12).
**/

function loadComments(movieId) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    commentsList.innerHTML = ''; 

    const allComments = JSON.parse(localStorage.getItem('movie_comments')) || {};
    const currentMovieComments = allComments[movieId] || [];

    if (currentMovieComments.length === 0) {
        commentsList.innerHTML = '<p style="color: var(--description-color); font-size: 14px;">Brak komentarzy. Bądź pierwszy!</p>';
        return;
    }

    for (let i = 0; i < currentMovieComments.length; i++) {
        const comment = currentMovieComments[i];
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `<strong>${comment.user}</strong><p>${comment.text}</p>`;
        commentsList.appendChild(div);
    }
}

/**
 * Sekcja: Obsługa formularza dodawania komentarzy.
 * Nasłuchuje zdarzenia 'submit' na poziomie dokumentu. 
 * Realizuje walidację danych wejściowych (min. długość znaków), 
 * zapisuje nowe opinie w LocalStorage w formacie JSON 
 * oraz odświeża widok listy komentarzy bez przeładowania strony.
 * @param {Event} e - Obiekt zdarzenia wysłania formularza (submit).
 * @description Wykorzystuje metodę 'unshift', aby nowe komentarze 
 * pojawiały się na początku listy, oraz 'trim' do usuwania zbędnych spacji.
**/

document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'comment-form') {
        e.preventDefault();

        const movieId = currentOpenMovieId; 
        const userInput = document.getElementById('comment-user');
        const textInput = document.getElementById('comment-text');

        const userValue = userInput.value.trim();
        const textValue = textInput.value.trim();

        if (userValue.length < 2 || textValue.length < 5) {
            alert("Uzupełnij formularz! Nick: min. 2 znaki, Komentarz: min. 5 znaków.");
            return; 
        }

        const allComments = JSON.parse(localStorage.getItem('movie_comments')) || {};
        
        if (!allComments[movieId]) {
            allComments[movieId] = [];
        }

        allComments[movieId].unshift({ 
            user: userValue, 
            text: textValue 
        });

        localStorage.setItem('movie_comments', JSON.stringify(allComments));
        
        loadComments(movieId);
        e.target.reset(); 
    }
});
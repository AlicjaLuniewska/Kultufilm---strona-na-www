/**
 * comments.js
 * Pobiera i wyświetla listę komentarzy dodanych przez zalogowanego użytkownika na jego profilu.
 */
function loadUserComments() {
    const profileComments = document.getElementById('profile-comments');
    if (!profileComments) return;

    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        profileComments.innerHTML = '<p>Zaloguj się, aby zobaczyć swoje komentarze.</p>';
        return;
    }

    const users = JSON.parse(localStorage.getItem('kf_users')) || [];
    const user = users.find(u => u.username.toLowerCase() === currentUser.toLowerCase());

    if (!user || !user.comments || user.comments.length === 0) {
        profileComments.innerHTML = '<p>Nie dodałeś jeszcze komentarzy.</p>';
        return;
    }

    profileComments.innerHTML = '';

    // Wyświetlamy komentarze od najnowszego
    [...user.comments].reverse().forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';

        div.innerHTML = `
            <div class="comment-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <strong>Film: ${comment.movieTitle || 'ID: ' + comment.movieId}</strong>
                <span class="comment-date" style="opacity: 0.6; font-size: 12px;">${comment.date}</span>
            </div>
            <p>${comment.text}</p>
        `;

        profileComments.appendChild(div);
    });
}

// Udostępniamy funkcję globalnie dla widoku filmu
window.loadUserComments = loadUserComments;

document.addEventListener('DOMContentLoaded', loadUserComments);
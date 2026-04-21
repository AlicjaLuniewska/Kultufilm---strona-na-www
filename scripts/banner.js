/**
 * Główna funkcja aktualizująca zawartość bannera na stronie głównej.
 * Zarządza tekstami, skraca opis oraz ustawia tło (z obsługą obrazka domyślnego).
 * @param {string} title - Tytuł filmu wyświetlany w bannerze.
 * @param {string} overview - Pełny opis filmu (zostanie skrócony do 250 znaków).
 * @param {string|number} year - Rok produkcji filmu.
 * @param {string|number} rating - Ocena filmu.
 * @param {string|null} backdropPath - Ścieżka do grafiki tła z API TMDB.
 * @returns {void}
**/

function updateBanner(title, overview, year, rating, backdropPath) {
    const bannerTitle = document.getElementById('banner-title');
    const bannerDesc = document.getElementById('banner-desc');
    const bannerMeta = document.getElementById('banner-meta');
    const bannerElement = document.getElementById('big-banner');
    const defaultImage = "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

    let finalDescription = overview; 
    if (overview.length > 250) {
        finalDescription = overview.slice(0, 250) + "...";
    }

    bannerTitle.innerText = title;
    bannerDesc.innerText = finalDescription;

    if (backdropPath && backdropPath !== 'null') {
        const imageUrl = `https://image.tmdb.org/t/p/w1280${backdropPath}`; 
        bannerElement.style.backgroundImage = `url('${imageUrl}')`;
    } else {
        bannerElement.style.backgroundImage = "url('" + defaultImage + "')";
    }
    renderBannerMeta(bannerMeta, year, rating);
}

/**
 * Renderuje metadane filmu (rok i ocenę z ikoną gwiazdki) wewnątrz podanego kontenera.
 * @param {HTMLElement} container - Element DOM, do którego zostanie wstrzyknięta treść.
 * @param {string|number} year - Rok produkcji filmu.
 * @param {string|number} rating - Ocena filmu (np. 7.5).
 * @returns {void} Funkcja nie zwraca wartości, modyfikuje bezpośrednio strukturę DOM.
**/

function renderBannerMeta(container, year, rating) {
    const starIcon = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16,9V8h-1V6h-1V4h-1V2h-2v2h-1v2H9v2H8v1H2v2h1v1h1v1h1v1h1v4H5v2H4v2h3v-1h2v-1h1v-1h4v1h1v1h2v1h3v-2h-1v-2h-1v-4h1v-1h1 v-1h1v-1h1V9H16z M16,12v1h-1v2h1v2h-2v-1h-4v1H8v-2h1v-2H8v-1H7v-1h3v-1h1V8h2v2h1v1h3v1H16z"/>
        </svg>`;
    
    container.innerHTML = `${year} &nbsp;&nbsp; ${starIcon} &nbsp;${rating}`;
}
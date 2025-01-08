const baseURL = 'https://api.spotify.com/v1';
const clientId = '8d42b3d091f64774985bae8f540ba265';
const clientSecret = '7f4b6982ad7544469e73172489f31e9f';
const authEndpoint = 'https://accounts.spotify.com/api/token';
let accessToken;

async function authenticate() {
    const response = await fetch(authEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    accessToken = data.access_token;
}

async function fetchTopTracksOfYear() {
    const currentYear = new Date().getFullYear();
    const response = await fetch(baseURL + '/browse/new-releases?limit=10&year=' + currentYear, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    const data = await response.json();
    return data.albums.items;
}

function displayTopTracks(tracks) {
    const songList = document.getElementById('song-list');
    songList.innerHTML = '';
    tracks.forEach(track => {
        const li = document.createElement('li');
        li.textContent = track.name + ' - ' + track.artists[0].name;
        songList.appendChild(li);
    });
}

window.addEventListener('load', async () => {
    await authenticate();
    const topTracksOfYear = await fetchTopTracksOfYear();
    displayTopTracks(topTracksOfYear);
});

async function searchSongs(query) {
    const response = await fetch(baseURL + '/search?q=' + encodeURIComponent(query) + '&type=track', {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    const data = await response.json();
    return data.tracks.items;
}

function displaySearchResults(results, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = result.name + ' - ' + result.artists[0].name;
        container.appendChild(li);
    });
}

function clearSearchResults(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
}

document.getElementById('search-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    const query = document.getElementById('search-input').value;
    const searchResults = await searchSongs(query);
    displaySearchResults(searchResults, 'search-results');
});

document.getElementById('clear-search-btn').addEventListener('click', () => {
    clearSearchResults('search-results');
});

async function searchSongsByYear(year) {
    const response = await fetch(baseURL + '/search?q=year:' + year + '&type=track', {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    const data = await response.json();
    return data.tracks.items;
}

document.getElementById('year-search-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    const year = document.getElementById('year-input').value;
    const searchResults = await searchSongsByYear(year);
    displaySearchResults(searchResults, 'year-search-results');
});

document.getElementById('clear-year-search-btn').addEventListener('click', () => {
    clearSearchResults('year-search-results');
});

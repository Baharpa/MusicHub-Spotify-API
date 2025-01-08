require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const baseURL = 'https://api.spotify.com/v1';
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
let accessToken;

app.use(express.static('public'));
app.use('/style', express.static('style'));
app.use('/javascript', express.static('javascript'));

async function authenticate() {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });

        const data = await response.json();
        accessToken = data.access_token;
        console.log('Access token refreshed');
    } catch (error) {
        console.error('Error refreshing token:', error);
    }
}

async function ensureAccessToken() {
    if (!accessToken) await authenticate();
}

setInterval(authenticate, 3600 * 1000);
authenticate();

app.get('/api/new-releases', async (req, res) => {
    try {
        await ensureAccessToken();
        const response = await fetch(`${baseURL}/browse/new-releases?limit=10`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        res.json(data.albums.items);
    } catch (error) {
        console.error('Error fetching new releases:', error);
        res.status(500).json({ error: 'Failed to fetch new releases' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

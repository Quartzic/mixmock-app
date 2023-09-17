
// spotifyConfig.authUrl = `https://accounts.spotify.com/authorize?client_id=${spotifyConfig.clientId}&response_type=code&redirect_uri=${spotifyConfig.redirectUri}&scope=user-top-read`;

// export async function getAccessToken(code) {
//     const tokenEndpoint = "https://accounts.spotify.com/api/token";
//     const authString = `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`;
//     const headers = {
//         'Authorization': 'Basic ' + btoa(authString),
//         'Content-Type': 'application/x-www-form-urlencoded'
//     };

//     const body = new URLSearchParams();
//     body.append("grant_type", "authorization_code");
//     body.append("code", code);
//     body.append("redirect_uri", spotifyConfig.redirectUri);

//     const response = await fetch(tokenEndpoint, {
//         method: "POST",
//         headers: headers,
//         body: body.toString()
//     });

//     const data = await response.json();
//     return data.access_token;
// }

import axios from 'axios';


export async function getUserTopTracks(accessToken) {
    const endpoint = "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=long_term";
    const headers = {
        'Authorization': 'Bearer ' + accessToken,
    };
    const response = await axios.get(endpoint, { headers: headers });
    return response.data.items;
}

export async function getUserTopArtists(accessToken) {
    const endpoint = "https://api.spotify.com/v1/me/top/artists?limit=5&time_range=long_term";
    const headers = {
        'Authorization': 'Bearer ' + accessToken,
    };
    const response = await axios.get(endpoint, { headers: headers });
    return response.data.items;
}

export async function getUserProfile(accessToken) {
    const endpoint = "https://api.spotify.com/v1/me";
    const headers = {
        'Authorization': 'Bearer ' + accessToken,
    };
    const response = await axios.get(endpoint, { headers: headers });
    return response.data;
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { functions } from "../firebase";
import {httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getUserTopTracks, getUserTopArtists, getUserProfile } from '../spotify';
import { Spinner } from '../components/Spinner';

export const SpotifyCallback = () => {

    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);
    const [userProfile, setUserProfile] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        async function fetchSpotifyData() {
            try {
                // use Firebase function to get access token without exposing secret                
                let accessToken;
                
                httpsCallable(functions, "getAccessToken")(
                    {
                        code: code
                    }
                ).then(
                    async (response) => {
                        accessToken = response.data;

                        const topTracks = await getUserTopTracks(accessToken);
                        setTracks(topTracks);  // store top tracks in state

                        const topArtists = await getUserTopArtists(accessToken);
                        setArtists(artists);

                        let genres = [];
                        topArtists.forEach((artist) => {
                            genres = genres.concat(artist.genres);
                        });

                        // get current user's profile
                        const userProfile = await getUserProfile(accessToken);
                        setUserProfile(userProfile);

                        await httpsCallable(functions, "createJobFromPrompt")({
                            tracks: topTracks,
                            artists: topArtists,
                            userProfile: userProfile
                        });

                        navigate('/');
                    }
                ).catch(
                    (error) => {
                        console.error("Error getting access token:", error);
                        navigate('/error');
                    }
                ); 
                
            } catch (error) {
                console.error("Error fetching Spotify data:", error);
                navigate('/error');
            }
        }

        if (code) {
            fetchSpotifyData();
        } else {
            navigate('/error');
        }
    }, [navigate]);

    return(
        <div className="flex flex-col h-screen w-screen items-center justify-center p-4">
            <div className="flex flex-col items-center gap-8">
                <h1 className="text-2xl font-bold text-gray-900">Generating your mixed drink...</h1>
                <Spinner />
            </div>
        </div>
    )
};
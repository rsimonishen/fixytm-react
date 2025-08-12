import { PlaylistCache, VideoCache } from "./cache-classes.ts";

declare global {
    interface Window {

        fixytm: {
            apiKeys: {
                GOOGLE_API_KEY: string;
                GOOGLE_ACCESS_TOKEN: string | undefined;
                GOOGLE_API_KEY_KIND: string;
                GOOGLE_API_KEY_EXPIRES_IN: number | undefined;
                IPINFO_API_KEY: string;
            };
            MAX_PLAYLIST_PAGE_ITEMS: number;
            MAX_VIDEOS_PAGE_ITEMS: number;
            MAX_CYCLES_PER_FETCH: number;
            MAX_CYCLES_PER_RENDER: number;
            cache: {
                playlists: PlaylistCache[];
                videos: VideoCache[];
            }
            user: {
                USER_COUNTRY: string | undefined;
            };
        }
    }
}

window.fixytm = {
    apiKeys: {
        GOOGLE_API_KEY: 'AIzaSyDbJWTlH_tBCaDqIGbfnxDNCN-XhnGltLA',
        GOOGLE_ACCESS_TOKEN: window.location.hash ? Object.fromEntries(new URLSearchParams(window.location.hash.substring(1))).access_token! : undefined,
        GOOGLE_API_KEY_KIND: window.location.hash ? "OAuth2" : "API Key",
        GOOGLE_API_KEY_EXPIRES_IN: window.location.hash ? Number(Object.fromEntries(new URLSearchParams(window.location.hash.substring(1))).expires_in!) : undefined,
        IPINFO_API_KEY: '8faf88230ab83b'
    },
    MAX_PLAYLIST_PAGE_ITEMS: 50,
    MAX_VIDEOS_PAGE_ITEMS: 50,
    MAX_CYCLES_PER_FETCH: 10,
    MAX_CYCLES_PER_RENDER: 50,
    cache: {
        playlists: [],
        videos: []
    },
    user: {
        USER_COUNTRY: undefined
    }
}

export default window.fixytm
import { PlaylistCache } from "./cache-classes";
import { sleep } from "./helper-scripts";
import type { Video } from "./related-interfaces";

declare global {
    interface Window {
        fixytm: {
            apiKeys: {
                GOOGLE_API_KEY: string;
                GOOGLE_ACCESS_TOKEN: string | undefined;
                GOOGLE_API_KEY_KIND: string;
                GOOGLE_ACCESS_TOKEN_EXPIRES_IN: number | undefined;
                GOOGLE_ACCESS_TOKEN_EXPIRED: boolean;
                IPINFO_API_KEY: string;
            };
            MAX_PLAYLIST_PAGE_ITEMS: number;
            MAX_VIDEOS_PAGE_ITEMS: number;
            MAX_CYCLES_PER_FETCH: number;
            MAX_CYCLES_PER_RENDER: number;
            cache: {
                playlists: PlaylistCache[];
                videos: Video[];
                syncedRadio: {
                    shelves: HTMLElement[];
                    map: Map<Video, HTMLElement> | undefined;
                };
            }
            user: {
                USER_COUNTRY: string | undefined;
            };
            observer: MutationObserver | undefined;
        }
    }
}

window.fixytm = {
    apiKeys: {
        GOOGLE_API_KEY: 'AIzaSyDbJWTlH_tBCaDqIGbfnxDNCN-XhnGltLA',
        GOOGLE_ACCESS_TOKEN: window.location.hash ?
            Object.fromEntries(new URLSearchParams(window.location.hash.substring(1))).access_token! : undefined,
        GOOGLE_API_KEY_KIND: window.location.hash ?
            "OAuth2" : "API Key",
        GOOGLE_ACCESS_TOKEN_EXPIRES_IN: window.location.hash ?
            Number(Object.fromEntries(new URLSearchParams(window.location.hash.substring(1))).expires_in!) : undefined,
        GOOGLE_ACCESS_TOKEN_EXPIRED: !window.location.hash,
        IPINFO_API_KEY: '8faf88230ab83b'
    },
    MAX_PLAYLIST_PAGE_ITEMS: 50,
    MAX_VIDEOS_PAGE_ITEMS: 50,
    MAX_CYCLES_PER_FETCH: 10,
    MAX_CYCLES_PER_RENDER: 50,
    cache: {
        playlists: [],
        videos: [],
        syncedRadio: {
            shelves: [],
            map: undefined
        }
    },
    user: {
        USER_COUNTRY: undefined
    },
    observer: undefined
}

if (window.fixytm.apiKeys.GOOGLE_API_KEY_KIND === "OAuth2") {(async () => {
    await new Promise((resolve) => {
        sleep(window.fixytm.apiKeys.GOOGLE_ACCESS_TOKEN_EXPIRES_IN! * 1000).then(
            () => {
                window.fixytm.apiKeys.GOOGLE_ACCESS_TOKEN_EXPIRED = true;
                window.fixytm.apiKeys.GOOGLE_API_KEY_KIND = "API Key";
                resolve(0)
            }
        )
    })
})()}

export default window.fixytm
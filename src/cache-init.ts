import { PlaylistCache } from "./cache-classes";
import { sleep } from "./helper-scripts";
import type {Channel, Video} from "./related-interfaces";

const hash: {
    access_token?: string;
    expires_in?: number;
} = Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)))

// Dedicated body for caching various constants as well as YTM content
const fixytm = {
    apiKeys: { // Authorization info
        GOOGLE_API_KEY: 'AIzaSyDbJWTlH_tBCaDqIGbfnxDNCN-XhnGltLA',
        GOOGLE_ACCESS_TOKEN: hash.access_token ?
            hash.access_token : undefined as string | undefined,
        GOOGLE_API_KEY_KIND: hash.access_token ?
            "OAuth2" : "API Key",
        GOOGLE_ACCESS_TOKEN_EXPIRES_IN: hash.expires_in ?
            Number(hash.expires_in!) : undefined as number | undefined,
        GOOGLE_ACCESS_TOKEN_EXPIRED: !(hash.expires_in && hash.access_token),
    },
    // FIX.YTM constants
    MAX_PLAYLIST_PAGE_ITEMS: 50,
    MAX_VIDEOS_PAGE_ITEMS: 50,
    MAX_COMMENTS_PAGE_ITEMS: 100,
    MAX_CHANNELS_PAGE_ITEMS: 50,
    MAX_CYCLES_PER_FETCH_COMMENTS: 5,
    MAX_CYCLES_PER_FETCH_CHANNELS: 5,
    MAX_CYCLES_PER_FETCH_PLAYLIST: 10,
    MAX_CYCLES_PER_FETCH_VIDEO: 10,
    MAX_CYCLES_PER_RENDER: 20,
    // Caching body
    cache: {
        playlists: [] as PlaylistCache[],
        videos: [] as Video[],
        syncedRadio: {
            shelves: [] as HTMLElement[],
            map: undefined as Map<Video, HTMLElement> | undefined,
        },
        commentThreads: [] as Comment[],
        channels: [] as Channel[],
    },
    user: {
        USER_COUNTRY: undefined as string | undefined,
        CHANNEL: undefined as Channel | undefined,
    },
    // FIX.YTM Mutation observer
    observer: undefined as MutationObserver | undefined,
    observerConnected: false,
}

// Authorization expiration timer
if (fixytm.apiKeys.GOOGLE_API_KEY_KIND === "OAuth2") {(async () => {
    await new Promise((resolve) => {
        sleep(fixytm.apiKeys.GOOGLE_ACCESS_TOKEN_EXPIRES_IN! * 1000).then(
            () => {
                fixytm.apiKeys.GOOGLE_ACCESS_TOKEN_EXPIRED = true;
                fixytm.apiKeys.GOOGLE_API_KEY_KIND = "API Key";
                resolve(0)
            }
        )
    })
})()}

export default fixytm
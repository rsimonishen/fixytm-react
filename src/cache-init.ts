import { PlaylistCache } from "./cache-classes";
import { sleep } from "./helper-scripts";
import type { Video } from "./related-interfaces";

const hash = Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)))

const fixytm = {
    apiKeys: {
        GOOGLE_API_KEY: 'AIzaSyDbJWTlH_tBCaDqIGbfnxDNCN-XhnGltLA' as string,
        GOOGLE_ACCESS_TOKEN: window.location.hash ?
            hash.access_token! : undefined as string | undefined,
        GOOGLE_API_KEY_KIND: window.location.hash ?
            "OAuth2" : "API Key" as string,
        GOOGLE_ACCESS_TOKEN_EXPIRES_IN: window.location.hash ?
            Number(hash.expires_in!) : undefined as number | undefined,
        GOOGLE_ACCESS_TOKEN_EXPIRED: !window.location.hash as boolean,
        IPINFO_API_KEY: '8faf88230ab83b' as string,
    },
    MAX_PLAYLIST_PAGE_ITEMS: 50 as number,
    MAX_VIDEOS_PAGE_ITEMS: 50 as number,
    MAX_COMMENTS_PAGE_ITEMS: 100 as number,
    MAX_CYCLES_PER_FETCH_COMMENTS: 5 as number,
    MAX_CYCLES_PER_FETCH_PLAYLIST: 10 as number,
    MAX_CYCLES_PER_FETCH_VIDEO: 10 as number,
    MAX_CYCLES_PER_RENDER: 50 as number,
    cache: {
        playlists: [] as PlaylistCache[],
        videos: [] as Video[],
        syncedRadio: {
            shelves: [] as HTMLElement[],
            map: undefined as Map<Video, HTMLElement> | undefined,
        },
        commentThreads: [] as Comment[],
    },
    user: {
        USER_COUNTRY: undefined as string | undefined,
    },
    observer: undefined as MutationObserver | undefined,
    observerConnected: false as boolean,
}

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
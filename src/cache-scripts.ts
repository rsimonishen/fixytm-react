import { PlaylistCache } from "./cache-classes";
import fixytm from "./cache-init";
import type { Video } from "./related-interfaces";

export function matchPlaylistCache(id: string, notify: boolean = false): PlaylistCache | null {
    const playlists: PlaylistCache[] = fixytm.cache.playlists;
    for (const playlist of playlists) {
        if (playlist.getCache("id") === id) {
            notify && console.log(`FIX.YTM React: found matching playlist in cache: ${playlist.getCache("id")}`);
            return playlist;
        }
    }
    console.log(`FIX.YTM React: no matching playlist found in cache: ${id}`);
    return null;
}

export function cachePlaylist(id: string, entry: PlaylistCache | {
    [key: string]: unknown;
    itemIds?: string[];
    mapOfDOM?: Map<Video, HTMLElement>;
    keys?: Video[];
    id?: string;
    currentOrder?: Video[];
}): void {
    const cachedPlaylist: PlaylistCache | null = matchPlaylistCache(id);
    if (cachedPlaylist) {
        for (const key in entry) cachedPlaylist.setCache(key, entry[key]);
        return;
    }
    fixytm.cache.playlists.push(new PlaylistCache(entry));
}

export function getRelevantGapiKey(): [string, boolean] {
    if (fixytm.apiKeys.GOOGLE_API_KEY_KIND === "OAuth2") return [fixytm.apiKeys.GOOGLE_ACCESS_TOKEN!, true]
    return [fixytm.apiKeys.GOOGLE_API_KEY, false]
}
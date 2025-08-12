import { PlaylistCache, VideoCache } from "./cache-classes";
import fixytm from "./cache-init";
import type { Video } from "./related-interfaces";

export function matchPlaylistCache(id: string): PlaylistCache | null {
    const playlists: PlaylistCache[] = fixytm.cache.playlists;
    for (const playlist of playlists) {
        if (playlist.getCache("id") === id) {
            console.log(`FIX.YTM React: found matching playlist in cache: ${playlist.getCache("id")}`);
            return playlist;
        }
    }
    console.log(`FIX.YTM React: no matching playlist found in cache: ${id}`);
    return null;
}

export function matchVideoCache(id: string): VideoCache | null {
    const videos: VideoCache[] = fixytm.cache.videos;
    for (const video of videos) {
        if (video.getCache("id") === id) {
            console.log(`FIX.YTM React: found matching video in cache: ${video.getCache("id")}`);
            return video;
        }
    }
    console.log(`FIX.YTM React: no matching video found in cache: ${id}`);
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

export function cacheVideo(id: string, entry: VideoCache | {
    [key: string]: unknown;
    video?: Video;
    id?: string;
}): void {
    const cachedVideo: VideoCache | null = matchVideoCache(id);
    if (cachedVideo) {
        for (const key in entry) cachedVideo.setCache(key, entry[key]);
        return;
    }
    if (fixytm.cache.videos.length >= 150) fixytm.cache.videos.shift();
    fixytm.cache.videos.push(new VideoCache(entry));
}

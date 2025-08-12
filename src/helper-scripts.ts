import type { Video } from "./related-interfaces";
import { PlaylistCache } from "./cache-classes";
import { fetchPlaylist, fetchVideos } from "./network-scripts";
import fixytm from "./cache-init";
import { matchPlaylistCache } from "./cache-scripts";

export function filterVideos(videos: Video[]): Video[] {
    if (!fixytm.user.USER_COUNTRY) throw new Error("FIX.YTM React error: user country not set");
    const output: Video[] = [];
    for (const video of videos) {
        if (video.contentDetails.regionRestriction) {
            const restrictions: {allowed?: string[], blocked?: string[]} = video.contentDetails.regionRestriction
            if (restrictions.allowed) { if (restrictions.allowed.includes(fixytm.user.USER_COUNTRY)) output.push(video);
            else console.error("FIX.YTM React: video not allowed in user country"); }
            else if (restrictions.blocked) { if (!restrictions.blocked.includes(fixytm.user.USER_COUNTRY)) output.push(video);
            else console.error("FIX.YTM React: video blocked in user country"); }
        } else output.push(video);
    }

    return output;
}

export function fetchPlaylistId (): string {
    if (window.location.pathname === "/playlist") return window.location.search.split("=")[1]
    else throw new Error("FIX.YTM React error: not in playlist page")
}

export function fetchPlaylistDOM (): HTMLElement {
    if (window.location.pathname === "/playlist")
        return document.querySelector("div#contents.ytmusic-playlist-shelf-renderer") as HTMLElement;
    else throw new Error("FIX.YTM React error: not in playlist page")
}

export function parseDate (date: string | Date): number { return Number(new Date(date)); }
export function parseDuration (duration: string): number {
    const regexp: RegExp = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
    const matches: RegExpMatchArray = duration.match(regexp) as RegExpMatchArray;
    const hours: number = matches[1] ? Number(matches[1]) : 0;
    const minutes: number = matches[2] ? Number(matches[2]) : 0;
    const seconds: number = matches[3] ? Number(matches[3]) : 0;
    return hours * 3600 + minutes * 60 + seconds;
}

export async function collectPlaylist(id: string = fetchPlaylistId()): Promise<PlaylistCache> {
    if (matchPlaylistCache(id)) {
        console.error("FIX.YTM React inconvenience: playlist already in cache");
        return matchPlaylistCache(id) as PlaylistCache;
    }
    const playlistItemIds: string[] = await fetchPlaylist(id);
    const playlistVideos: Video[] = await fetchVideos(playlistItemIds);
    const playlistKeys: Video[] = filterVideos(playlistVideos);
    const playlistWrapper: HTMLElement = fetchPlaylistDOM();
    const shelves: NodeListOf<ChildNode> = playlistWrapper.childNodes;
    const map = new Map<Video, HTMLElement>
    for (let i = 0; i < playlistKeys.length; i++) map.set(playlistKeys[i], shelves[i] as HTMLElement);
    const cache = {
        id: id,
        itemIds: playlistItemIds,
        keys: playlistKeys,
        mapOfDOM: map
    }
    return new PlaylistCache(cache);
}

export async function renderPlaylist(
    expectedShelves: number,
    wrapper: HTMLElement = fetchPlaylistDOM()): Promise<void> {
    const present = wrapper.childNodes;
    while (present.length < expectedShelves) {
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(100);
    }
    window.scrollTo(0, 0);
}

export async function sleep(ms: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, ms)); }

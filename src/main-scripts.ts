import { PlaylistCache } from "./cache-classes";
import {
    fetchPlaylistDOM,
    parseDate,
    parseDuration,
    renderPlaylist,
    collectPlaylist,
    mapPlaylist
} from "./helper-scripts";
import type { Video } from "./related-interfaces";
import fixytm from "./cache-init";

// Sort an array of videos by criteria and automatically rearrange it correspondingly
export async function sortPlaylist(id: string, criteria: string, rearrange: boolean): Promise<Video[] | void> {
    const playlist: PlaylistCache = await collectPlaylist(id, true)
    const keys = playlist.getCache("keys") as Video[];
    await renderPlaylist(keys.length, fetchPlaylistDOM());
    if (!playlist.getCache("mapOfDOM") || !playlist.getCache("mapOfDOMRelevance")) mapPlaylist(keys, playlist);
    const output: Video[] = [];
    let target: string;
    let targetParser: (value: string) => number;
    if (!playlist || !playlist.integrity) throw new Error("FIX.YTM React error: playlist not found or its cache isn't full");
    const videos = playlist.getCache("keys") as Video[];
    switch (criteria) {
        case "likeCount": target = "statistics"; targetParser = Number; break;
        case "viewCount": target = "statistics"; targetParser = Number; break;
        case "publishedAt": target = "snippet"; targetParser = parseDate; break;
        case "duration": target = "contentDetails"; targetParser = parseDuration; break;
        default: throw new Error("invalid criteria");
    }

    for (let i = 0; i < videos.length; i++) {
        let max: number = -Infinity;
        let lead: Video | undefined = undefined;
        for (const video of videos) {
            // @ts-expect-error because a string key defines the value endpoint
            const comparingValue = targetParser(video[target][criteria]);
            if (comparingValue > max && !output.includes(video)) {
                lead = video;
                max = comparingValue;
            }
        }
        if (lead) output.push(lead); else throw new ReferenceError(
            "FIX.YTM React TypeError: sortPlaylist: something went wrong - no lead found");
    }

    if (rearrange) {
        await arrangePlaylist(output, playlist);
    } else return output;
}

// Arrange a playlist accordingly to an order of videos
export async function arrangePlaylist(order: Video[],
    playlist: PlaylistCache): Promise<void> {
    await renderPlaylist(order.length, fetchPlaylistDOM());
    if (!playlist.integrity)
        throw new Error("FIX.YTM React error: playlist not found or its cache isn't full");
    const map: Map<Video, HTMLElement> = playlist.getCache("mapOfDOM") as Map<Video, HTMLElement>;
    const wrapper: HTMLElement = fetchPlaylistDOM();
    order.forEach(video => wrapper.appendChild(map.get(video)!));
    playlist.setCache("currentOrder", order);
}

// Checks if user is listening a radio station that entirely belongs to one of the cached playlists,
// and rearranges that radio station correspondingly (only works visually)
export function matchRadioStation(playlist?: PlaylistCache): void {
    const playlists: PlaylistCache[] = fixytm.cache.playlists;
    const queueRenderer: HTMLElement = document.querySelector("div#contents.ytmusic-player-queue")!;
    const children = Array.from(queueRenderer.childNodes) as HTMLElement[];
    const cache = fixytm.cache.syncedRadio;
    const isMatching: boolean = (cache.shelves.length > 0 && cache.shelves.every((shelf: HTMLElement) =>
        children.includes(shelf)))
    const queue: HTMLElement[] = isMatching ? cache.shelves : Array.from(queueRenderer.childNodes) as HTMLElement[];
    const queueTitles: string[] = queue.map(el => el.querySelector("yt-formatted-string.song-title.ytmusic-player-queue-item")!.innerHTML);
    if (!playlist) {
        playlist = playlists.find(playlist => {
            const shelvesMap = playlist.getCache("mapOfDOM") as Map<Video, HTMLElement>;
            const keys = playlist.getCache("keys") as Video[];
            let count = 0;
            keys.forEach((key, i) => (shelvesMap.get(key)!.querySelector("a.yt-formatted-string")!.innerHTML === queueTitles[i]) && count++)
            return count === queueTitles.length;
        })
    }

    if (!playlist) { console.error("FIX.YTM React error: no matching playlist found to synchronize radio station queue with"); return; }

    const map = cache.map || new Map<Video, HTMLElement>();
    const rawKeys = playlist.getCache("keys") as Video[];
    const keys = rawKeys.filter(key => {
        const map = playlist.getCache("mapOfDOM") as Map<Video, HTMLElement>
        return queueTitles.includes(map.get(key)!.querySelector("a.yt-formatted-string")!.innerHTML)
    }) as Video[];
    if (!cache.map || !isMatching) { let count = 0; keys.forEach(() => {
        const __map = playlist.getCache("mapOfDOM") as Map<Video, HTMLElement>
        map.set(keys.find(candidate => __map.get(candidate)!.querySelector("a.yt-formatted-string")!.innerHTML === queueTitles[count])!,
            queue[count++])
    })}
    const rawOrder = playlist.getCache("currentOrder") as Video[];
    const order = rawOrder.filter(key => keys.includes(key)) as Video[];

    for (const video of order) queueRenderer.appendChild(map.get(video)!);
    cache.shelves = Array.from(queueRenderer.childNodes) as HTMLElement[];
    cache.map = map;
}

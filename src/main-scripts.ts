import { PlaylistCache } from "./cache-classes";
import { fetchPlaylistId, fetchPlaylistDOM, parseDate, parseDuration } from "./helper-scripts";
import { matchPlaylistCache } from "./cache-scripts";
import type { Video } from "./related-interfaces";

export async function sortPlaylist(id: string, criteria: string, rearrange: boolean): Promise<Video[] | void> {
    const output: Video[] = [];
    let target: string;
    let targetParser: (value: string) => number;
    const playlist: PlaylistCache | null = matchPlaylistCache(id);
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
        arrangePlaylist(output);
    } else return output;
}

export function arrangePlaylist(order: Video[], id: string = fetchPlaylistId()): void {
    const targetPlaylist: PlaylistCache | null = matchPlaylistCache(id)
    if (!targetPlaylist || !targetPlaylist.integrity)
        throw new Error("FIX.YTM React error: playlist not found or its cache isn't full");
    const map: Map<Video, HTMLElement> = targetPlaylist.getCache("mapOfDOM") as Map<Video, HTMLElement>;
    const wrapper: HTMLElement = fetchPlaylistDOM();
    for (const video of order) wrapper.appendChild(map.get(video)!);
    targetPlaylist.setCache("currentOrder", order);
}


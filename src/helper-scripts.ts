import type { Video } from "./related-interfaces";
import { PlaylistCache } from "./cache-classes";
import { fetchComments, fetchPlaylist, fetchVideos } from "./network-scripts";
import fixytm from "./cache-init";
import { cachePlaylist, matchPlaylistCache } from "./cache-scripts";
import type { Comment } from "./related-interfaces";

// Filter content with region restriction applied towards user
export function filterVideos(videos: Video[]): Video[] {
    if (!fixytm.user.USER_COUNTRY) throw new Error("FIX.YTM React error: user country not set");
    return videos.filter(video => video.contentDetails.regionRestriction?.allowed?.includes(fixytm.user.USER_COUNTRY!) || !video.contentDetails.regionRestriction?.blocked?.includes(fixytm.user.USER_COUNTRY!))
}

// Get ID of the playlist user is viewing
export function fetchPlaylistId (): string {
    if (window.location.pathname === "/playlist") return Object.fromEntries(new URLSearchParams(window.location.search)).list;
    else throw new Error("FIX.YTM React error: not in playlist page")
}

// Get ID of the video user is watching
export function fetchVideoId (): string {
    if (window.location.pathname === "/watch") return Object.fromEntries(new URLSearchParams(window.location.search)).v;
    else throw new Error("FIX.YTM React error: not in video page")
}

// Get the playlist renderer as a DOM node
export function fetchPlaylistDOM (): HTMLElement {
    if (window.location.pathname === "/playlist")
        return document.querySelector("div#contents.ytmusic-playlist-shelf-renderer") as HTMLElement;
    else throw new Error("FIX.YTM React error: not in playlist page")
}

// Parse date to a processable number
export function parseDate (date: string | Date): number { return Number(new Date(date)); }

// Parse duration to a processable number
export function parseDuration (duration: string): number {
    const regexp: RegExp = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
    const matches: RegExpMatchArray = duration.match(regexp) as RegExpMatchArray;
    const hours: number = matches[1] ? Number(matches[1]) : 0;
    const minutes: number = matches[2] ? Number(matches[2]) : 0;
    const seconds: number = matches[3] ? Number(matches[3]) : 0;
    return hours * 3600 + minutes * 60 + seconds;
}

// Parse processed date to a displayable string
export function formatDate (datetime: string, includeTime: boolean): string {
    const regexp: RegExp = /(\d+-\d+-\d+)T(\d+:\d+:\d+)?Z?/
    const result = datetime.match(regexp);
    if (!result) return "";
    const date = result[1] ? result[1].split("-").join(".") : "Unknown date";
    const time = result[2] ? result[2] + " UTC" : "";
    return `${date} ${includeTime ? time : ""}`;
}

// Parse processed duration to a displayable string
export function formatDuration(duration: string): string {
    const regexp: RegExp = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
    const matches: RegExpMatchArray = duration.match(regexp) as RegExpMatchArray;
    return matches.slice(1).map(item => item ? item.padStart(2, "0") : "00").join(":")
}

// Check if a comment contains illegal embedded emojis that are unsupported outside Youtube
export function commentContentWarning(comment: string): boolean {
    return /<a href="[\w-]+\/[\w-]+"><\/a>/.test(comment)
}

// Find a playlist in cache or fetch it by ID and optionally cache it
export async function collectPlaylist(id: string = fetchPlaylistId(), cacheInstantly: boolean): Promise<PlaylistCache> {
    if (matchPlaylistCache(id)) {
        console.log("FIX.YTM React: automatically pulling playlist from cache");
        return matchPlaylistCache(id) as PlaylistCache;
    }
    const playlistItemIds: string[] = await fetchPlaylist(id);
    const playlistVideos: Video[] = await fetchVideos(playlistItemIds);
    const playlistKeys: Video[] = filterVideos(playlistVideos);
    const cache = {
        id: id,
        itemIds: playlistItemIds,
        keys: playlistKeys,
    }
    if (cacheInstantly) { cachePlaylist(id, cache); }
    return matchPlaylistCache(id) as PlaylistCache;
}

// Find a video in cache or fetch it by ID
export async function collectVideo(id: string): Promise<Video> {
    return fixytm.cache.videos.find((video: Video) => video.id === id) || (await fetchVideos([id], false, true))[0];
}

// Fetch video comments from cache or fetch them by video ID
export async function collectComments(videoId: string): Promise<Comment[] | Error> {
    return fixytm.cache.videos.find((video: Video) => video.id === videoId)?.comments || (await fetchComments(videoId, true));
}

// Update playlist nodes list (useful for when the playlist is rerendered)
export function mapPlaylist(
    keys: Video[], playlist: PlaylistCache,
    nodes: NodeListOf<ChildNode> = fetchPlaylistDOM().childNodes): Map<Video, HTMLElement> {
    const map: Map<Video, HTMLElement> = new Map();
    for (const key in keys) map.set(keys[key], nodes[key] as HTMLElement);
    playlist.setCache("mapOfDOM", map);
    playlist.setCache("mapOfDOMRelevance", true);
    return map;
}

// Wait until all playlist shelves arrive
// (YouTube initially doesn't render more than 100 playlist shelves;
// useful for when there's more than 100 songs in a playlist)
export async function renderPlaylist(
    expectedShelves: number,
    wrapper: HTMLElement = fetchPlaylistDOM()): Promise<void> {
    const present = wrapper.childNodes;
    let cycle: number = 0;
    while (present.length < expectedShelves && cycle++ < fixytm.MAX_CYCLES_PER_RENDER) {
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(100);
    }
    window.scrollTo(0, 0);
}

// Sleep function
export async function sleep(ms: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, ms)); }

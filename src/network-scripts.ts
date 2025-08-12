import type { Video, PlaylistResponse, VideosResponse, IpinfoResponse } from "./related-interfaces";
import { fetchJSON, RequestString } from "./network-utils";
import { filterVideos } from "./helper-scripts";
import fixytm from "./cache-init";
import { cacheVideo } from "./cache-scripts.ts";

export async function fetchUserCountry (): Promise<string> {
    const req: RequestString = new RequestString("https://ipinfo.io/json");
    req.appendArg(`token=${fixytm.apiKeys.IPINFO_API_KEY}`);
    const response = await fetchJSON(req);
    const object: IpinfoResponse = JSON.parse(response) as IpinfoResponse;
    return object.country;
}

export async function fetchPlaylist (id: string): Promise<string[]> {
    const output: string[] = [];
    let cycle: number = 0;
    const args: string[] = [
        "part=contentDetails",
        `playlistId=${id}`,
        `maxResults=${fixytm.MAX_PLAYLIST_PAGE_ITEMS}`,
        `key=${fixytm.apiKeys.GOOGLE_API_KEY}`,
    ]
    let undone: boolean = true;
    while (undone && cycle < fixytm.MAX_CYCLES_PER_FETCH) {
        const req: RequestString = new RequestString(`https://www.googleapis.com/youtube/v3/playlistItems?${args.join("&")}`);
        let response: string;
        try { response = await fetchJSON(req) } catch (e) {console.error(`FIX.YTM React error: fetchPlaylist: ${e}`); return []}
        const obj: PlaylistResponse = JSON.parse(response) as PlaylistResponse;
        for (const item of obj.items) output.push(item.contentDetails.videoId)
        if (obj.nextPageToken) { cycle++; args[4] = `pageToken=${obj.nextPageToken}` } else undone = false;
    }

    return output;
}

export async function fetchVideos (ids: string[] | string, filter: boolean = true, cacheVideos: boolean = false): Promise<Video[]> {
    let output: Video[] = [];
    let cycle: number = 0;
    const args: string[] = [
        "part=snippet%2Cstatistics%2CcontentDetails",
        `maxResults=${fixytm.MAX_VIDEOS_PAGE_ITEMS}`,
        `key=${fixytm.apiKeys.GOOGLE_API_KEY}`
    ]
    let undone: boolean = true;
    while (undone && cycle < fixytm.MAX_CYCLES_PER_FETCH) {
        const idsPortion: string[] = [];
        for (let i = 0; i < 50; i++) idsPortion.push(ids[i + 50 * cycle])
        const req: RequestString = new RequestString(`https://www.googleapis.com/youtube/v3/videos?${args.join("&")}&id=${idsPortion.join("%2C")}`);
        let response: string;
        try { response = await fetchJSON(req) } catch (e) {console.error(`FIX.YTM React error: fetchVideos: ${e}`); return []}
        const obj: VideosResponse = JSON.parse(response) as VideosResponse;
        for (const video of obj.items) output.push(video)
        if (output.length < ids.length) cycle++; else undone = false;
    }
    if (filter) output = filterVideos(output)
    if (cacheVideos) {
        for (const video of output) {
            cacheVideo(video.id, {id: video.id, video: video})
        }
    }
    return output;
}
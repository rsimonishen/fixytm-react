import type {
    Video,
    PlaylistResponse,
    VideosResponse,
    IpinfoResponse,
    CommentsResponse,
    Reply, RepliesResponse
} from "./related-interfaces";
import { fetchJSON, RequestString } from "./network-utils";
import {collectVideo, filterVideos} from "./helper-scripts";
import fixytm from "./cache-init";
import { getRelevantGapiKey } from "./cache-scripts";
import { type Comment } from "./related-interfaces";

export async function fetchUserCountry (): Promise<string> {
    const req: RequestString = new RequestString("https://ipinfo.io/json");
    req.appendArg(`token=${fixytm.apiKeys.IPINFO_API_KEY}`);
    const response = await fetchJSON(req);
    const object: IpinfoResponse = JSON.parse(response) as IpinfoResponse;
    return object.country;
}

export async function fetchPlaylist (id: string, [key, isOauthAccessToken] = getRelevantGapiKey()): Promise<string[]> {
    const output: string[] = [];
    let cycle: number = 0;
    const args: string[] = [
        "part=contentDetails",
        `playlistId=${id}`,
        `maxResults=${fixytm.MAX_PLAYLIST_PAGE_ITEMS}`,
    ]
    const headers: Record<string, string> = {}
    if (isOauthAccessToken) args.push(`access_token=${key}`);
    else args.push(`key=${key}`)
    let undone: boolean = true;
    while (undone && cycle < fixytm.MAX_CYCLES_PER_FETCH_PLAYLIST) {
        const req: RequestString = new RequestString(`https://www.googleapis.com/youtube/v3/playlistItems?${args.join("&")}`);
        let response: string;
        try { response = await fetchJSON(req, headers) } catch (e) {console.error(`FIX.YTM React error: fetchPlaylist: ${e}`); return []}
        const obj = JSON.parse(response) as PlaylistResponse;
        for (const item of obj.items) output.push(item.contentDetails.videoId)
        if (obj.nextPageToken) { cycle++; args[4] = `pageToken=${obj.nextPageToken}` } else undone = false;
    }

    return output;
}

export async function fetchVideos (
    ids: string[], filter: boolean = true,
    cacheVideos: boolean = false,
    [key, isOauthAccessToken] = getRelevantGapiKey()): Promise<Video[]> {
    let output: Video[] = [];
    let cycle: number = 0;
    // noinspection SpellCheckingInspection
    const args: string[] = [
        "part=snippet%2Cstatistics%2CcontentDetails",
        `maxResults=${fixytm.MAX_VIDEOS_PAGE_ITEMS}`,
    ]
    if (isOauthAccessToken) args.push(`access_token=${key}`);
    else args.push(`key=${key}`)
    let undone: boolean = true;
    while (undone && cycle < fixytm.MAX_CYCLES_PER_FETCH_VIDEO) {
        const idsPortion: string[] = [];
        for (let i = 0; i < 50; i++) if(ids[i + 50 * cycle]) idsPortion.push(ids[i + 50 * cycle]);
        const req: RequestString = new RequestString(`https://www.googleapis.com/youtube/v3/videos?${args.join("&")}&id=${idsPortion.join("%2C")}`);
        let response: string;
        try { response = await fetchJSON(req) } catch (e) {console.error(`FIX.YTM React error: fetchVideos: ${e}`); return []}
        const obj = JSON.parse(response) as VideosResponse;
        for (const video of obj.items) output.push(video)
        if (output.length < ids.length) cycle++; else undone = false;
    }
    if (filter) output = filterVideos(output)
    if (cacheVideos) fixytm.cache.videos.push(...output);
    return output;
}

export async function fetchComments(
    videoId: string,
    cacheComments: boolean,
    nextPageToken?: string,
    [key, isOauthAccessToken] = getRelevantGapiKey()): Promise<Comment[] | Error> {
    const output: Comment[] = [];
    let cycle: number = 0;
    const video = await collectVideo(videoId);
    const args: string[] = [
        "part=snippet",
        `maxResults=${fixytm.MAX_COMMENTS_PAGE_ITEMS}`,
        "order=relevance",
        `videoId=${videoId}`,
        `${isOauthAccessToken ? "access_token" : "key"}=${key}`,
        `${nextPageToken ? `pageToken=${nextPageToken}` : null}`,
    ]
    let undone: boolean = true;
    while (undone && cycle < fixytm.MAX_CYCLES_PER_FETCH_COMMENTS) {
        const req = new RequestString(`https://www.googleapis.com/youtube/v3/commentThreads?${args.join("&")}`);
        let response: string;
        try { response = await fetchJSON(req) } catch (e) { console.error(e); return new Error(`FIX.YTM React error: The comment thread for this video is unavailable for an unknown reason.`) }
        const obj = JSON.parse(response) as CommentsResponse;
        for (const comment of obj.items) output.push(comment)
        if (obj.nextPageToken) { cycle++; args[5] = `pageToken=${obj.nextPageToken}`; video.commentNextPageToken = obj.nextPageToken; }
        else { undone = false; video.commentNextPageToken = undefined; }

    }
    if (cacheComments) video.comments = video.comments ? [...video.comments, ...output] : video.comments = [...output]
    return output;
}

export async function fetchReplies(
    thread: Comment,
    [key, isOauthAccessToken] = getRelevantGapiKey()): Promise<Reply[] | Error> {
    const output: Reply[] = [];
    let cycle: number = 0;
    const args: string[] = [
        "part=snippet",
        `maxResults=${fixytm.MAX_COMMENTS_PAGE_ITEMS}`,
        `parentId=${thread.id}`,
        `${isOauthAccessToken ? "access_token" : "key"}=${key}`
    ]
    let undone: boolean = true;
    while (undone && cycle < fixytm.MAX_CYCLES_PER_FETCH_COMMENTS) {
        const req = new RequestString(`https://www.googleapis.com/youtube/v3/comments?${args.join("&")}`);
        let response: string;
        try { response = await fetchJSON(req) } catch (e) { console.error(e); return new Error(`FIX.YTM React error: The comment thread for this video is unavailable for an unknown reason.`) }
        const obj = JSON.parse(response) as RepliesResponse;
        for (const reply of obj.items) output.push(reply);
        if (obj.nextPageToken) { cycle++; args[4] = `pageToken=${obj.nextPageToken}` } else undone = false;
    }
    thread.replies = { comments: output }

    return output;
}
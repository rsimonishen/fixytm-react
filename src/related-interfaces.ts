export interface Video {
    [key: string]: unknown;
    id: string;
    statistics: {
        viewCount: string;
        likeCount: string;
        dislikeCount?: string;
        favoriteCount: string;
        commentCount: string;
    };
    snippet: {
        publishedAt: string;
        title: string;
        description: string;
        thumbnails: {
            default: {
                url: string;
            }
        };
        channelTitle: string;
        channelId: string;
    };
    contentDetails: {
        duration: string;
        regionRestriction?: {
            allowed?: string[];
            blocked?: string[];
        }
    };
}
export interface Playlist {
    [key: string]: unknown;
    items: PlaylistItem[];
}
export interface PlaylistResponse extends Playlist {
    [key: string]: unknown;
    pageInfo: {
        totalResults: number;
    }
    nextPageToken?: string;
}
export interface PlaylistItem {
    [key: string]: unknown;
    contentDetails: {
        videoId: string;
    }
}
export interface VideosResponse {
    [key: string]: unknown;
    items: Video[];
}
export interface IpinfoResponse {
    [key: string]: unknown;
    ip: string;
    hostname: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
}
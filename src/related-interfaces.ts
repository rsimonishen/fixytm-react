// Chassis for all subsequent received JSON network responses
export interface JsonResponse {
    error?: {
        code: number;
        message: string;
        errors: {
            message: string;
            domain: string;
            reason: string;
            location: string;
            locationType: string;
        }[]
    }
    nextPageToken?: string;
}

// Represents a video object (used both in cache and in manipulations)
export interface Video {
    [key: string]: unknown;
    kind: string;
    etag: string;
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
                width: number;
                height: number;
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
    comments?: Comment[];
    commentsOpen?: string;
    commentNextPageToken?: string;
}

// Represents chassis for Playlist JSON objects. All data contained in received Playlist JSON objects
// is primarily useless except for the items list
export interface Playlist {
    [key: string]: unknown;
    items: PlaylistItem[];
}

// Chassis for playlistItems API GET request response content
export interface PlaylistResponse extends Playlist, JsonResponse {
    [key: string]: unknown;
    pageInfo: {
        totalResults: number;
    }
}

// Is a raw approximation for a Video, and is only used in playlists, because playlist requests
// only provide the very essential info about their items, not enough to form a Video object
export interface PlaylistItem {
    [key: string]: unknown;
    contentDetails: {
        videoId: string;
    }
}

// Chassis for videos API GET request response content
export interface VideosResponse extends JsonResponse {
    [key: string]: unknown;
    items: Video[];
}

// Chassis for commentThreads API GET request by video ID response content
export interface CommentsResponse extends JsonResponse {
    [key: string]: unknown;
    items: Comment[];
}

// Chassis for comments API GET request by comment ID response content
export interface RepliesResponse extends JsonResponse {
    [key: string]: unknown;
    items: Reply[];
}

// Represents a Comment object with all its descending properties and is used
// both in cache and in functions
export interface Comment {
    kind: string;
    etag: string;
    id: string;
    snippet: {
        channelId: string;
        videoId: string;
        topLevelComment: {
            kind: string;
            etag: string;
            id: string;
            snippet: {
                channelId: string;
                videoId: string;
                textOriginal: string;
                textDisplay: string;
                authorDisplayName: string;
                authorProfileImageUrl: string;
                authorChannelUrl: string;
                authorChannelId: {
                    value: string;
                };
                canRate: boolean;
                viewerRating: string;
                likeCount: number;
                publishedAt: string;
                updatedAt: string;
            }
        };
        canReply: boolean;
        totalReplyCount: number;
        isPublic: boolean;
    }
    replies?: {
        comments: Reply[];
    }
}

// Chassis for commentThreads API POST requests
export interface CommentEntity {
    snippet: {
        channelId: string;
        videoId: string;
        topLevelComment: {
            snippet: {
                textOriginal: string;
            }
        }
    }
}

// Chassis for commentThreads API POST request responses
export interface CommentEntityResponse extends JsonResponse, Comment {}

// Reply object obtained via comments API GET request by a comment thread ID
export interface Reply {
    kind: string;
    etag: string;
    id: string;
    snippet: {
        channelId: string;
        videoId: string;
        textOriginal: string;
        textDisplay: string;
        parentId: string;
        authorDisplayName: string;
        authorProfileImageUrl: string;
        authorChannelUrl: string;
        authorChannelId: {
            value: string;
        };
        canRate: boolean;
        viewerRating: string;
        likeCount: number;
        publishedAt: string;
        updatedAt: string;
    }
}

// Chassis for comments API POST requests
export interface ReplyEntity {
    snippet: {
        textOriginal: string;
        parentId: string;
    }
}

// Chassis for comments API POST request responses
export interface ReplyEntityResponse extends JsonResponse, Reply {}

// Interface for ipinfo API GET request responses
export interface IpinfoResponse extends JsonResponse {
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
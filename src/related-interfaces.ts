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

export interface Video extends JsonResponse {
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
export interface Playlist {
    [key: string]: unknown;
    items: PlaylistItem[];
}
export interface PlaylistResponse extends Playlist, JsonResponse {
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
export interface VideosResponse extends JsonResponse {
    [key: string]: unknown;
    items: Video[];
}
export interface CommentsResponse extends JsonResponse {
    [key: string]: unknown;
    items: Comment[];
}
export interface RepliesResponse extends JsonResponse {
    [key: string]: unknown;
    items: Reply[];
}
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
export interface CommentEntityResponse extends JsonResponse, Comment {}
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
export interface ReplyEntity {
    snippet: {
        textOriginal: string;
        parentId: string;
    }
}
export interface ReplyEntityResponse extends JsonResponse, Reply {}
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
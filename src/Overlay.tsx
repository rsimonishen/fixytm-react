/* eslint-disable react-hooks/exhaustive-deps */
import {type ReactElement, useEffect, useState, useRef, useReducer} from 'react'
import './Overlay.css'
import {
    collectComments,
    collectVideo, commentContentWarning,
    fetchPlaylistId,
    fetchVideoId,
    formatDate,
    formatDuration
} from "./helper-scripts";
import { matchRadioStation, sortPlaylist } from "./main-scripts";
import fixytm from "./cache-init";
import type {Comment, Video} from "./related-interfaces";
import type {PlaylistCache} from "./cache-classes";
import {
    deleteCommentThread,
    deleteReply,
    fetchComments,
    fetchReplies,
    insertCommentThread,
    insertReply
} from "./network-scripts";

// The overlay renderer
export function Overlay(): ReactElement {
    // FIX.YTM attaches its observer to the targets listed here for automatic rendering when DOM changes
    const fixytmObserverTargets: Element[] = [
        document.querySelector('div#contents.ytmusic-section-list-renderer')!,
        document.querySelector('ytmusic-player-bar')!,
    ]

    // Automatic re-rendering call upon mutation
    const fixytmObserver: MutationObserver = fixytm.observer || new MutationObserver(() => {
        setMode(window.location.pathname);
        console.log("FIX.YTM React mutation observer: target DOM has changed")})

    // Caching the observer so that this function doesn't create new ones each rerender
    fixytm.observer = fixytmObserver;

    // State control
    const [overlay, showOverlay] = useState<boolean>(false);
    const [mode, setMode] = useState<string>("/");
    const [authorised, authorise] = useState<boolean>(false);
    const [videoPanel, showVideoPanel] = useState<boolean>(false);
    const [viewedVideo, setViewedVideo] = useState<Video | undefined>(undefined);
    const [viewedVideoComments, setViewedVideoComments] = useState<Comment[] | Error>([]);
    const [repliedComment, setRepliedComment] = useState<Comment | undefined>(undefined);
    const commentTextArea = useRef<HTMLTextAreaElement>(null)

    // Comment section reset upon change in the video
    useEffect(() => {
        setViewedVideoComments([]);
    }, [viewedVideo]);

    // FIX.YTM Mutation observer may not connect to all nodes that require observation
    // within the first attempt, so this effect stands for retry for each of the targets,
    // and also prevents the observer from connecting to one target multiple times,
    // which causes massive throttling and waste of resource
    useEffect(() => {
        if (!fixytm.observerConnected) {
            try {
                fixytmObserverTargets.forEach(target => fixytmObserver.observe(target, {
                    childList: true,
                    attributes: true,
                }))
                fixytm.observerConnected = true;
            }
            catch (e) {
                console.error(`FIX.YTM React error: couldn't connect the observer: ${e}`);
            }
        }
        if (fixytm.apiKeys.GOOGLE_API_KEY_KIND === "OAuth2"
            && !fixytm.apiKeys.GOOGLE_ACCESS_TOKEN_EXPIRED) authorise(true);
        else authorise(false)
    });

    // Render the primary control panel
    function MainPanel ({authorised, mode}: {authorised: boolean, mode: string}) {
        // Render controls for the primary control panel accordingly
        // to the section of the website the user is currently in
        function Controls({mode}: {mode: string}) {
            switch (mode) {
                case "/playlist":
                    return <>
                        <button
                            className={"fix-ytm-functionality-item"}
                            onClick={() => sortPlaylist(
                                fetchPlaylistId(),
                                "likeCount",
                                true)
                            }>Sort by likes</button>
                        <button
                            className={"fix-ytm-functionality-item"}
                            onClick={() => sortPlaylist(
                                fetchPlaylistId(),
                                "viewCount",
                                true
                            )}>Sort by views</button>
                        <button
                            className={"fix-ytm-functionality-item"}
                            onClick={() => sortPlaylist(
                                fetchPlaylistId(),
                                "publishedAt",
                                true
                            )}>Sort by date</button>
                        <button
                            className={"fix-ytm-functionality-item"}
                            onClick={() => sortPlaylist(
                                fetchPlaylistId(),
                                "duration",
                                true
                            )}>Sort by duration</button>
                    </>
                case "/watch": {
                    const playlist = fixytm.cache.playlists.find(
                        (playlist: PlaylistCache) => (playlist.getCache("mapOfDOMRelevance") as boolean &&
                            playlist.getCache("currentOrder")));

                    return <>
                        { playlist ? <button
                            className={"fix-ytm-functionality-item"}
                            onClick={() => matchRadioStation(playlist)}
                            title={"Synchronise radio station with sorted playlist order"}>
                            Sync station
                        </button> : null }
                        <button
                            className={"fix-ytm-functionality-item"}
                            onClick={async () => {
                                const id: string = fetchVideoId();
                                const video = await collectVideo(id);
                                setViewedVideo(video);
                                showVideoPanel(true);
                            }}
                            title={"View current video statistics and data in a separate tab"}>View video</button>
                    </>
                }

                default:
                    if (!document.querySelector("div#contents.ytmusic-playlist-shelf-renderer"))
                        fixytm.cache.playlists.forEach((playlist: PlaylistCache) => playlist.setCache("mapOfDOMRelevance", false))
                    return <></>;
            }
        }

        return <>
            <button
                className={"fix-ytm-overlay-tab-hide"}
                onClick={() => {
                    showOverlay(false);
                    showVideoPanel(false)
                }}><hr /></button>
            <a style={{display: authorised ? "none" : "block"}} id={"fix-ytm-auth-button"} className={"fix-ytm-isolated-item"} title={"Authorization via OAuth2 unlocks more features of the app and helps fight API quota overloads"} href={"https://accounts.google.com/o/oauth2/v2/auth?client_id=76921199374-mfrm9nc1c8ceg2sitqdkjrvb4uh16qn4.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fmusic.youtube.com&response_type=token&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.force-ssl&state=pass-through%20value%20Accept:%20application/json%20###"}>
                Authorize via OAuth2
            </a>
            <div id={"fix-ytm-overlay-inner-wrapper"} className={"fix-ytm-flex-wrapper"}>
                <Controls mode={mode} />
            </div>
            <p id={"fix-ytm-overlay-current-mode"} className={"fix-ytm-functionality-item"}>
                {mode}
            </p>
        </>
    }

    // Render the video interaction & info panel
    function VideoPanel ({video}: {video: Video | undefined}) {
        function Comments({contents, video}: {contents: Error | Comment[], video: Video}) {
            // Render comment section if there are comments and they're present in cache
            const [, rerender] = useReducer(x => !x, false)

            // Renderer for the textarea for user comment
            function UserCommentField({video, repliedComment}: {video: Video, repliedComment: Comment | undefined}): ReactElement {
                return <div id={"fix-ytm-leave-comment"}>
                    {repliedComment ? <>
                        <p>
                            Replying to: {repliedComment.snippet.topLevelComment.snippet.authorDisplayName}
                        </p>
                        <button
                            onClick={() => setRepliedComment(undefined)}
                            title={"Cancel reply"}>
                            ╳
                        </button>
                    </> : null}
                    <textarea
                        ref={commentTextArea}
                        autoCapitalize={"sentences"}
                        autoComplete={"on"}
                        autoCorrect={"on"}
                        placeholder={"Leave your comment here"}
                        wrap={"hard"}
                        cols={8}>
                    </textarea>
                    <button
                        disabled={fixytm.apiKeys.GOOGLE_API_KEY_KIND !== "OAuth2"}
                        title={fixytm.apiKeys.GOOGLE_API_KEY_KIND !== "OAuth2" ? "You need to authorize via OAuth2 to leave comments" : undefined}
                        onClick={async () => {
                            const final = commentTextArea.current!.value.trim();
                            if (/\S/.test(final)) {
                                if (repliedComment) insertReply(repliedComment, final).then(() => { setViewedVideoComments(video.comments!); rerender() })
                                else insertCommentThread(video, final).then(() => { setViewedVideoComments(video.comments!); rerender() });
                                commentTextArea.current!.value = "";
                            }
                        }}>
                        Post
                    </button>
                </div>
            }

            // Comment renderer
            function Comment({ comment }: {comment: Comment}): ReactElement {
                const [, rerender] = useReducer(x => !x, false)

                const topSnippet = comment.snippet.topLevelComment.snippet;
                return <>
                    <header className={"fix-ytm-comment-info"}>

                        <img src={topSnippet.authorProfileImageUrl} alt={"Comment author's avatar"} />
                        <div>
                            <h3>{topSnippet.authorDisplayName}</h3>
                            <p title={
                                `Published at ${formatDate(topSnippet.publishedAt, true)} 
                        \nUpdated at ${formatDate(topSnippet.updatedAt, true)}`
                            }>{formatDate(topSnippet.publishedAt, false)}</p>
                        </div>
                    </header>
                    <p className={"fix-ytm-comment-text"} dangerouslySetInnerHTML={{__html: topSnippet.textDisplay}}></p>
                    <footer className={"fix-ytm-comment-stats"}>
                        {topSnippet.authorChannelId.value === fixytm.user.CHANNEL?.id ? <>
                            <button
                                title={"Delete this comment"}
                                onClick={async () => {
                                    deleteCommentThread(comment).then((response) => { if (response) rerender() })
                                }}>Delete</button>
                            <span title={"This comment is yours"}>i</span>
                        </> : null}
                        <button
                            className={"fix-ytm-leave-reply"}
                            onClick={async () => {
                                setRepliedComment(comment)
                            }}>Reply</button>
                        {commentContentWarning(topSnippet.textDisplay) ? <span title={"This comment contains illegal YT-embedded emojis"}>!</span> : null}
                        <p>{topSnippet.likeCount} likes</p>
                        <p>{comment.snippet.totalReplyCount} replies</p>
                    </footer>
                </>
            }

            // Comment reply thread renderer
            function Replies({comment}: {comment: Comment}): ReactElement {
                const [, rerender] = useReducer(x => !x, false)

                return <>
                    {
                        comment.replies ? comment.replies.comments.map(reply => (
                            <>
                                <div className={"fix-ytm-comment-reply-container"} key={reply.id}>
                                    <div className={"fix-ytm-comment-reply"}>
                                        <header className={"fix-ytm-comment-info"}>
                                            <img src={reply.snippet.authorProfileImageUrl} alt={"Comment author's avatar"} />
                                            <div>
                                                <h3>{reply.snippet.authorDisplayName}</h3>
                                                <p title={
                                                    `Published at ${formatDate(reply.snippet.publishedAt, true)} 
                                            \nUpdated at ${formatDate(reply.snippet.updatedAt, true)}`
                                                }>{formatDate(reply.snippet.publishedAt, false)}</p>
                                            </div>
                                        </header>
                                        <p className={"fix-ytm-comment-text"} dangerouslySetInnerHTML={{__html: reply.snippet.textDisplay}}></p>
                                        <footer className={"fix-ytm-comment-stats"}>
                                            {reply.snippet.authorChannelId.value === fixytm.user.CHANNEL?.id ? <>
                                                <button
                                                    title={"Delete this reply"}
                                                    onClick={async () => {
                                                        deleteReply(reply).then((response) => { if (response) rerender() })
                                                    }}>Delete</button>
                                                <span title={"This reply is yours"}>i</span>
                                            </> : null}
                                            <p>{reply.snippet.likeCount} likes</p>
                                        </footer>
                                    </div>
                                </div>
                            </>
                        )) : <>
                            <div className={"fix-ytm-view-thread"}>
                                <button
                                    onClick={async () => {
                                        if (!comment.replies) fetchReplies(comment).then(() => rerender());
                                    }}>View replies</button></div>
                        </>
                    }
                </>
            }

            switch (true) {
                case video.autoGenerated:
                    console.log("FIX.YTM React inconvenience: viewed video is automatically generated by YouTube, therefore its comments are closed or unavailable")
                    return <p>
                        FIX.YTM React inconvenience: this video is automatically generated by YouTube, therefore its comments are closed or unavailable
                    </p>
                case contents instanceof Error:
                    console.error(`FIX.YTM React error: Comments: ${contents}`);
                    return <p>{contents.message}</p>;
                case (contents as Comment[]).length <= 0: return Number(video.statistics.commentCount) > 0 ? <>
                    <button
                        className={"fix-ytm-functionality-item"}
                        onClick={async () => {
                            collectComments(viewedVideo!).then((comments) => setViewedVideoComments(comments));
                        }}
                        title={"View current video comments"}
                        style={{margin: "auto", marginTop: "15px"}}>View comments</button></> : <>
                    {video.commentsOpen === "open" ? <UserCommentField video={video} repliedComment={repliedComment} /> :
                        video.commentsOpen === "closed" ? <p>
                            FIX.YTM React error: The comment thread for this video is unavailable for an unknown reason.
                        </p> : null}
                    <button
                        className={"fix-ytm-functionality-item"}
                        onClick={async () => {
                            collectComments(viewedVideo!).then((comments) => setViewedVideoComments(comments));
                        }}
                        title={"See if you can leave a comment"}
                        style={{margin: "auto", marginTop: "15px", display: video.commentsOpen ? "none" : "flex"}}>Leave a comment</button>
                </>
                case (contents as Comment[]).length > 0: return <>
                    <UserCommentField video={video} repliedComment={repliedComment} />
                    {
                        (contents as Comment[]).map(comment => (
                            <>
                                <div className={"fix-ytm-comment"}>
                                    <section className={"fix-ytm-top-comment"}>
                                        <Comment comment={comment} />
                                    </section>
                                    { comment.snippet.totalReplyCount > 0 ? <section className={"fix-ytm-comment-replies"}>
                                        <Replies comment={comment} />
                                    </section> : null }
                                </div>
                            </>
                        ))
                    }
                    {
                        video.commentNextPageToken ? <>
                            <div className={"fix-ytm-view-thread"}>
                                <button
                                    onClick={async () => {
                                        fetchComments(video.id, true, video.commentNextPageToken).then(() => setViewedVideoComments(video.comments!));
                                    }}>View more comments</button></div>
                        </> : null
                    }
                </>;
            }
        }

        return video ? <>
            <header id={"fix-ytm-video-tab-header"} className={"fix-ytm-flex-wrapper"} style={{marginTop: `32px`}}>
                <img id={"fix-ytm-video-tab-thumbnail"} src={video.snippet.thumbnails.default.url} alt={"Video thumbnail"} style={{width: '25%'}}/>
                <div style={{width: `70%`}}>
                    <p className={"fix-ytm-video-data"} title={"Song name"}>
                        {video.snippet.title}
                    </p>`
                    <p className={"fix-ytm-video-data"} title={"Song author"}>
                        {video.snippet.channelTitle}
                    </p>
                    <p className={"fix-ytm-video-data"} title={"Song release date"}>
                        {formatDate(video.snippet.publishedAt, false)}
                    </p>
                    <p className={"fix-ytm-video-data"} title={"Song duration"}>
                        {formatDuration(video.contentDetails.duration)}
                    </p>
                </div>
            </header>
            <section id={"fix-ytm-video-tab-statistics"} className={"fix-ytm-flex-wrapper"}>
                <p title={"Song playbacks"} className={"fix-ytm-video-data"}>
                    {video.statistics.viewCount || "0"} views
                </p>
                <p title={"Song likes"} className={"fix-ytm-video-data"}>
                    {video.statistics.likeCount || "0"} likes
                </p>
                <p title={"Song comments count"} className={"fix-ytm-video-data"}>
                    {video.statistics.commentCount || "0"} comments
                </p>
            </section>
            <section id={"fix-ytm-video-comments"}>
                <p className={"fix-ytm-video-data"}>Comments</p>
                <Comments contents={viewedVideoComments} video={video} />
            </section>
        </> : null;
    }

    // Final overlay menu
    return (
        <div id={"fix-ytm-overlay-menu"}>
            <button
                id={"fix-ytm-overlay-trigger"}
                className={"fix-ytm-functionality-item"}
                onClick={() => {showOverlay(true); setMode(window.location.pathname)}}
                style={{display: overlay ? 'none' : 'flex'}}>Fix</button>
            <div id={"fix-ytm-overlay-main"} className={"fix-ytm-flex-wrapper fix-ytm-overlay-tab"} style={{display: overlay ? 'flex' : 'none'}}>
                <MainPanel authorised={authorised} mode={mode} />
            </div>
            <div id={"fix-ytm-video-panel"} className={"fix-ytm-overlay-tab"} style={{display: videoPanel ? 'inline-block' : 'none'}}>
                <button className={"fix-ytm-overlay-tab-hide"} onClick={() => showVideoPanel(false)}><hr /></button>
                <VideoPanel video={viewedVideo} />
            </div>
        </div>
    )
}
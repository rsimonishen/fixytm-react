/* eslint-disable react-hooks/exhaustive-deps */
import { type ReactElement, useEffect, useState, useRef } from 'react'
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
import {fetchComments, fetchReplies, insertCommentThread, insertReply} from "./network-scripts";

export function Overlay(): ReactElement {
    const fixytmObserverTargets: Element[] = [
        document.querySelector('div#contents.ytmusic-section-list-renderer')!,
        document.querySelector('ytmusic-player-bar')!,
    ]

    const fixytmObserver: MutationObserver = fixytm.observer || new MutationObserver(() => {
        setMode(window.location.pathname);
        console.log("FIX.YTM React mutation observer: target DOM has changed")})
    fixytm.observer = fixytmObserver;

    const [overlay, showOverlay] = useState<boolean>(false);
    const [mode, setMode] = useState<string>("/");
    const [authorised, authorise] = useState<boolean>(false);
    const [videoPanel, showVideoPanel] = useState<boolean>(false);
    const [viewedVideoId, setViewedVideoId] = useState<string>("");
    const [viewedVideoComments, setViewedVideoComments] = useState<Comment[] | Error>([]);
    const [viewedCommentThread, setViewedCommentThread] = useState<string | undefined>(undefined);
    const [repliedComment, setRepliedComment] = useState<Comment | undefined>(undefined);
    const commentTextArea = useRef<HTMLTextAreaElement>(null)


    useEffect(() => {
        setViewedVideoComments([]);
        setViewedCommentThread(undefined);
    }, [viewedVideoId]);


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
                            await collectVideo(id);
                            setViewedVideoId(id);
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

    function MainPanel ({authorised, mode}: {authorised: boolean, mode: string}) {
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

    function VideoPanel ({videoId}: {videoId: string}) {
        const video = fixytm.cache.videos.find((video: Video) => video.id === videoId);
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

    function Comments({contents, video}: {contents: Error | Comment[], video: Video}) {
        switch (true) {
            case contents instanceof Error:
                console.error(`FIX.YTM React error: Comments: ${contents}`);
                return <p>{contents.message}</p>;
            case (contents as Comment[]).length <= 0: return Number(video.statistics.commentCount) > 0 ? <>
                <button
                    className={"fix-ytm-functionality-item"}
                    onClick={async () => {
                        const comments = await collectComments(viewedVideoId);
                        setViewedVideoComments(comments)
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
                        const comments = await collectComments(viewedVideoId);
                        setViewedVideoComments(comments)
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
                                    await fetchComments(video.id, true, video.commentNextPageToken);
                                    setViewedVideoComments(video.comments!);
                                }}>View more comments</button></div>
                    </> : null
                }
            </>;
        }
    }

    function Comment({ comment }: {comment: Comment}): ReactElement {
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
    function Replies({comment}: {comment: Comment}): ReactElement {
        return <>
            {
                viewedCommentThread === comment.id ? comment.replies!.comments.map(reply => (
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
                                    <p>{reply.snippet.likeCount} likes</p>
                                </footer>
                            </div>
                        </div>
                    </>
                )) : <>
                    <div className={"fix-ytm-view-thread"}>
                        <button
                            onClick={async () => {
                                if (!comment.replies) await fetchReplies(comment);
                                setViewedCommentThread(comment.id)
                            }}>View replies</button></div>
                </>
            }
        </>
    }
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
                <button onClick={async () => {
                    const final = commentTextArea.current!.value.trim();
                    if (/\S/.test(final)) {
                        if (repliedComment) await insertReply(repliedComment, final);
                        else await insertCommentThread(video, final);
                    }
                    commentTextArea.current!.value = "";
                    setViewedVideoId(video.id);
                }}>
                    Post
                </button>
            </div>
    }

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
                <VideoPanel videoId={viewedVideoId} />
            </div>
        </div>
    )
}
import { type ReactElement, useState } from 'react'
import './Overlay.css'
import { collectPlaylist, fetchPlaylistId, matchPlaylistCache } from "./helper-scripts";
import { sortPlaylist } from "./main-scripts";


export function Overlay(): ReactElement {
    const fixytmObserverTargets: Element[] = [
        document.querySelector('div#contents.ytmusic-section-list-renderer')!,
        document.querySelector('ytmusic-player-bar')!,
    ]

    const fixytmObserver: MutationObserver = new MutationObserver(() => {
        setMode(window.location.pathname);
        console.log("FIX.YTM React mutation observer: target DOM has changed")})
    for (const target of fixytmObserverTargets) fixytmObserver.observe(target, { attributes: true, childList: true })

    function RenderControls(x: string): ReactElement {
        switch (x) {
            case "/playlist":
                if (!document.querySelector("ytmusic-playlist-shelf-renderer")) return <></>
                synchronousCollectPlaylist();
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
            default:
                return <></>;
        }
    }

    const [overlay, showOverlay] = useState<boolean>(false);
    const [mode, setMode] = useState<string>("");
    return (
        <>
            <button
                id={"fix-ytm-overlay-trigger"}
                className={"fix-ytm-functionality-item"}
                onClick={() => {showOverlay(true); setMode(window.location.pathname)}}
                style={{display: overlay ? 'none' : 'flex'}}>Fix</button>
            <div id={"fix-ytm-overlay-menu"} style={{display: overlay ? 'flex' : 'none'}}>
                <button id={"fix-ytm-overlay-hide"} onClick={() => showOverlay(false)}><hr /></button>
                <div className={"flex-wrapper"} id={"fix-ytm-overlay-inner-wrapper"}>
                    {RenderControls(mode)}
                </div>
                <p id={"fix-ytm-overlay-current-mode"} className={"fix-ytm-functionality-item"}>
                    {mode}
                </p>
            </div>
        </>
    )

}

function synchronousCollectPlaylist(id: string = fetchPlaylistId()): void {
    (async () => {
        if (matchPlaylistCache(id)) return;
        try { const playlistCache = await collectPlaylist(id);
        window.fixytm.cache.playlists.push(playlistCache); }
        catch (e) {
            console.error("FIX.YTM React error: synchronousCollectPlaylist: failed to synchronously collect playlist: " + e);
        }
    })()
}
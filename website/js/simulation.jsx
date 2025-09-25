import { useRef, useState } from "react";
import '../css/style.css'
import '../css/bootstrap.min.css'
import thumbnail from "../img/musicicon.png"
import supdanger from "../img/supdanger.jpeg"

export function Simulation() {
    const [mode, setMode] = useState("")
    const [videoViewed, setVideoViewed] = useState(false)
    const demoFrame = useRef(null);

    function sortVideos(criteria, videos = demoFrame.current.childNodes) {
        const childrenArray = [...videos]
        switch (criteria) {
            case "views": {
                const valuesArray = childrenArray.map(c => Number(c.querySelector(".video-views").textContent.split(" ")[0]))
                const sortedValues = [...valuesArray].sort((a, b) => b - a)
                sortedValues.forEach(value => {
                    demoFrame.current.appendChild(childrenArray[valuesArray.indexOf(value)])
                })
                break
            }
            case "likes": {
                const valuesArray = childrenArray.map(c => Number(c.querySelector(".video-likes").textContent.split(" ")[0]))
                const sortedValues = [...valuesArray].sort((a, b) => b - a)
                sortedValues.forEach(value => {
                    demoFrame.current.appendChild(childrenArray[valuesArray.indexOf(value)])
                })
                break
            }
            case "date": {
                const valuesArray = childrenArray.map(c => Number(new Date(c.querySelector(".video-date").textContent)))
                const sortedValues = [...valuesArray].sort((a, b) => a - b)
                sortedValues.forEach(value => {
                    demoFrame.current.appendChild(childrenArray[valuesArray.indexOf(value)])
                })
                break
            }
            case "duration": {
                const rawValuesArray = childrenArray.map(c => c.querySelector(".video-duration").textContent)
                const valuesArray = rawValuesArray.map(v => {
                    const time = v.split(":")
                    return Number(time[0]) * 60 + Number(time[1])
                })
                const sortedValues = [...valuesArray].sort((a, b) => b - a)
                sortedValues.forEach(value => {
                    demoFrame.current.appendChild(childrenArray[valuesArray.indexOf(value)])
                })
                break
            }
        }
    }

    function Tab({mode: mode}) {
        switch (mode) {

            case "/playlists":
                return <div className={"fix-ytm-tab col-12 col-sm-6 col-lg-4 col-xxl-3 d-flex align-items-center justify-content-around flex-row flex-wrap"}>
                    <button
                        className={"fix-ytm-functionality-item"}
                        onClick={() => {sortVideos("views")}}>
                        Sort by views
                    </button>
                    <button
                        className={"fix-ytm-functionality-item"}
                        onClick={() => {sortVideos("likes")}}>
                        Sort by likes
                    </button>
                    <button
                        className={"fix-ytm-functionality-item"}
                        onClick={() => {sortVideos("date")}}>
                        Sort by date
                    </button>
                    <button
                        className={"fix-ytm-functionality-item"}
                        onClick={() => {sortVideos("duration")}}>
                        Sort by duration
                    </button>
                </div>
            case "/videos":
                return <div className={"fix-ytm-tab col-12 col-sm-6 col-lg-4 col-xxl-3 overflow-y-auto"}>
                    {
                        videoViewed ? <div>
                                <header className={"row align-items-center"}>
                                    <img className={"col-4"} src={supdanger} alt="thumbnail" />
                                    <div className={"col-8 py-1"}>
                                        <p className={"text-end lead"}>
                                            What's Up Danger
                                        </p>
                                        <h6 className={"text-end"}>
                                            Blackway - Topic
                                        </h6>
                                        <h6 className={"text-end"}>
                                            2018.12.13
                                        </h6>
                                        <h6 className={"text-end"}>
                                            00:03:43
                                        </h6>
                                    </div>
                                </header>
                                <section className={"row border-bottom border-white"}>
                                    <p className={"col-6 font-monospace text-center text-white"}>
                                        102432347 views
                                    </p>
                                    <p className={"col-6 font-monospace text-center text-white"}>
                                        1001957 likes
                                    </p>
                                    <p className={"col-12 font-monospace text-center text-white"}>
                                        5148 comments
                                    </p>
                                </section>
                                <footer>
                                    <h5 className={"lead text-start py-2"}>
                                        Comments
                                    </h5>
                                    <p className={"text-start"}>
                                        Comments are only available in the full version of the extension
                                    </p>
                                </footer>
                            </div> :
                            <div className={"w-100 h-100 d-flex justify-content-center align-items-center"}>
                                <button
                                    className={"fix-ytm-functionality-item"}
                                    onClick={() => setVideoViewed(true)}>
                                    View video
                                </button>
                            </div>
                    }
                </div>
        }
        return null
    }

    function YTMFrame({mode: mode}) {
        function Video({title, views, likes, date, duration, icon}) {
            return <div className={"fix-ytm-video row bg-black py-1 align-items-center"}>
                <img src={icon} alt="thumbnail" className={"col-2 col-md-1"} />
                <p className={"col-8 col-md-9"}>{title}</p>
                <p className={"col-2 video-duration text-end"}>{duration}</p>
                <ul className={"col-12 list-unstyled row"}>
                    <li className={"col-6 col-md-4 text-center video-views"}>
                        {views} views
                    </li>
                    <li className={"col-6 col-md-4 text-center video-likes"}>
                        {likes} likes
                    </li>
                    <li className={"col-12 col-md-4 text-center video-date"}>
                        {date}
                    </li>
                </ul>
            </div>
        }

        switch (mode) {
            case "/playlists":
                return <div ref={demoFrame} className={"col-12 col-sm-5 col-lg-7 col-xxl-8 "}>
                    <Video title={"Song 1"} views={8931} likes={312} date={"2006-12-27"} duration={"3:20"} icon={thumbnail}/>
                    <Video title={"Song 2"} views={7132} likes={297} date={"2009-09-21"} duration={"4:19"} icon={thumbnail}/>
                    <Video title={"Song 3"} views={1839} likes={201} date={"2022-02-30"} duration={"2:10"} icon={thumbnail}/>
                    <Video title={"Song 4"} views={9322} likes={543} date={"2014-04-13"} duration={"3:45"} icon={thumbnail}/>
                    <Video title={"Song 5"} views={4319} likes={70} date={"2008-10-07"} duration={"2:59"} icon={thumbnail}/>
                </div>
            case "/videos":
                return <div ref={demoFrame} className={"col-12 col-sm-5 col-lg-7 col-xxl-8 row"}>
                    <img src={supdanger} alt={"thumbnail"} />
                </div>
        }
    }

    return <>
        <div id={"mode-select"} className={"row font-monospace text-white"}>
            <button
                className={"simulation-mode col-6 text-white py-3"}
                onClick={() => setMode("/playlists")}
                style={{backgroundColor: mode === "/playlists" ? 'rgba(0, 0, 0, 0.25)' : null}}>
                Playlists
            </button>
            <button
                className={"simulation-mode col-6 text-white py-3"}
                onClick={() => setMode("/videos")}
                style={{backgroundColor: mode === "/videos" ? 'rgba(0, 0, 0, 0.25)' : null}}>
                Videos
            </button>
        </div>
        <div id={"simulation"} className={"row p-4 align-items-center text-white"} style={{backgroundClip: mode ? "padding-box" : "content-box"}}>
            <Tab mode={mode} />
            <div className={"d-none d-sm-block col-sm-1"} />
            <YTMFrame mode={mode} />
        </div>
    </>
}

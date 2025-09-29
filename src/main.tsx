import { createRoot } from 'react-dom/client'
import { Overlay } from './Overlay'
import fixytm from './cache-init'
import {fetchChannels} from "./network-scripts"
import { getRelevantGapiKey } from "./cache-scripts";

console.log('FIX.YTM React is loading')

console.log('FIX.YTM React says Hello World!')
console.log("FIX.YTM React: Welcome to the ultimate YT Music scraper!")
console.log(`FIX.YTM React: Current YT Data API v3 key: ${getRelevantGapiKey()[0]}, authorized: ${getRelevantGapiKey()[1]}`);

(async () => { // User region recognition

    if (fixytm.apiKeys.GOOGLE_ACCESS_TOKEN) fixytm.user.CHANNEL = (await fetchChannels([], true, true))[0]
})()

const __root: HTMLDivElement = document.createElement('div')! as HTMLDivElement
__root.id = 'fix-ytm-root-react'
document.body.appendChild(__root)

// Entry point
createRoot(__root).render(
    <Overlay />
)

console.log('FIX.YTM React: DOM loaded')



import { createRoot } from 'react-dom/client'
import { Overlay } from './Overlay'
import fixytm from './cache-init'
import { fetchUserCountry } from "./network-scripts"
import { getRelevantGapiKey } from "./cache-scripts";

console.log('FIX.YTM React is loading')

console.log('FIX.YTM React says Hello World!')
console.log("FIX.YTM React: Welcome to the ultimate YT Music scraper!")
console.log(`FIX.YTM React: Current YT Data API v3 key: ${getRelevantGapiKey()[0]}, authorized: ${getRelevantGapiKey()[1]}`)
console.log(`FIX.YTM React: Current ipinfo API key: ${fixytm.apiKeys.IPINFO_API_KEY}`);

(async () => {
    fixytm.user.USER_COUNTRY = await fetchUserCountry()
    console.log(`FIX.YTM React: user country - ${fixytm.user.USER_COUNTRY}`)
})()

const __root: HTMLDivElement = document.createElement('div')! as HTMLDivElement
__root.id = 'fix-ytm-root-react'
document.body.appendChild(__root)
createRoot(__root).render(
    <Overlay />
)

console.log('FIX.YTM React: DOM loaded')



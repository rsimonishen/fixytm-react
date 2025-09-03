export class RequestString {
    private content: string;
    constructor (content: string) {
        this.content = content
    }
    appendArg (arg: string | string[]): void {
        const value = Array.isArray(arg) ? arg.join("%2C") : arg;

        if (this.content.endsWith("?")) this.content += value;
        else if (this.content.includes("?")) this.content += `&${value}`;
        else this.content += `?${arg}`;
    }
    get URL(): string { return this.content; }
}

export async function fetchJSON (req: RequestString, headers?: Record<string, string>): Promise<string> {
    return await new Promise((resolve, reject) => {
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open("GET", req.URL);
        if (headers) for (const key in headers) xhr.setRequestHeader(key, headers[key]);
        xhr.onload = () => {
            console.log(`FIX.YTM React: ${req.URL} fetched: ${xhr.status} ${xhr.responseText.length} bytes`);
            if (xhr.status === 200) resolve(xhr.responseText); else reject(xhr.statusText);
        }
        xhr.onerror = () => {
            console.error(`FIX.YTM React error: ${req.URL} fetch failed: ${xhr.status} ${xhr.responseText}`);
            reject(xhr.statusText);
        }
        xhr.send();
    })
}

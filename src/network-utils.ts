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
    getContent(): string {
        return this.content;
    }
}

export async function fetchJSON (req: RequestString, headers?: Record<string, string>): Promise<string> {
    let output: string = "";
    await new Promise((resolve, reject) => {
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open("GET", req.getContent());
        if (headers) for (const key in headers) xhr.setRequestHeader(key, headers[key]);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(`FIX.YTM React: fetched json object successfully, status: 200; response: \n${xhr.responseText}`);
                output = xhr.responseText;
                resolve(0);
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                reject(new Error(`FIX.YTM React: failed to fetch json object, status: ${xhr.status}; response: \n${xhr.responseText}`))
            } else {
                console.log(`FIX.YTM React: fetching json object; ready state: ${xhr.readyState}`);
            }
        }
        xhr.send();
    })
    return output;
}

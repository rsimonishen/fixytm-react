import type { Video } from "./related-interfaces";

export class PlaylistCache {
    [key: string]: unknown;
    private static readonly _requiredKeys = [
        "id", "itemIds", "mapOfDOM",
        "keys"
    ]
    private isEntire: boolean = false;
    // @ts-expect-error because a string key defines the cache pull
    private itemIds: string[] | undefined;
    // @ts-expect-error because a string key defines the cache pull
    private mapOfDOM: Map<Video, HTMLElement> | undefined;
    // @ts-expect-error because a string key defines the cache pull
    private mapOfDOMRelevance: boolean = false;
    // @ts-expect-error because a string key defines the cache pull
    private keys: Video[] | undefined;
    // @ts-expect-error because a string key defines the cache pull
    private id: string | undefined;
    // @ts-expect-error because a string key defines the cache pull
    private currentOrder: Video[] | undefined;

    get integrity(): boolean { return this.isEntire; }

    constructor(cache: PlaylistCache | {
        [key: string]: unknown;
        itemIds?: string[];
        mapOfDOM?: Map<Video, HTMLElement>;
        keys?: Video[];
        id?: string;
        currentOrder?: Video[];
    }) {
        for (const key in cache) this[key] = cache[key];
        this.checkIntegrity();
    }

    setCache(
        parameter: string,
        value: unknown): void {
        try { this[parameter] = value; }
        catch (e) {
            console.error(`FIX.YTM React error: invalid cache parameter ${parameter} or
            ${value} doesn't match type of ${parameter}; caught error: ${e}`);
        }
        this.checkIntegrity();
    }

    getCache(parameter: string):
        unknown | undefined {
        return this[parameter];
    }

    private checkIntegrity(): void {
        for (const key of PlaylistCache._requiredKeys) {
            if (this[key] === undefined) { this.isEntire = false; return; }
        }
        this.isEntire = true;
    }
}
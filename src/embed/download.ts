import * as fs from "node:fs";
import * as afs from "node:fs/promises";
import axios from "axios";

/** Handles remote asset downloading and writing to file system. */
export interface Downloader {
    /**
     * Downloads asset with specified url and writes it to a file with specified name.
     * @remarks Concurrent requests for same URLs are queued and results are cached.
     * @param url URL of the asset to download; http or https is expected.
     * @param filePath File system path to write the downloaded asset.
     */
    download(url: string, filePath: string): Promise<void>;
}

export type DownloadOptions = {
    /**
     * How long to wait when downloading each asset, in seconds.
     * @default 30
     */
    timeout?: number;
    /**
     * How many times to restart the download when request fails.
     * @default 3
     */
    retryLimit?: number;
    /**
     * How long to wait before restarting the download on request fail, in seconds.
     * @default 6
     */
    retryDelay?: number;
}

export const defaultDownloadOptions = {
    timeout: 30,
    retryDelay: 6,
    retryLimit: 3
};

export class DefaultDownloader implements Downloader {
    private readonly downloads = new Map<string, Promise<void>>;
    private readonly retries = new Map<string, number>;
    private readonly timeoutSeconds: number;
    private readonly maxRetryDelay: number;
    private readonly retryLimit: number;

    constructor(options?: DownloadOptions) {
        this.timeoutSeconds = options?.timeout ?? defaultDownloadOptions.timeout;
        this.maxRetryDelay = options?.retryDelay ?? defaultDownloadOptions.retryDelay;
        this.retryLimit = options?.retryLimit ?? defaultDownloadOptions.retryLimit;
    }

    public async download(url: string, filePath: string) {
        if (this.downloads.has(filePath))
            return this.downloads.get(filePath);
        this.downloads.set(filePath, fs.existsSync(filePath)
            ? Promise.resolve()
            : this.downloadWithRetries(url, filePath));
        return this.downloads.get(filePath);
    }

    private async downloadWithRetries(url: string, filePath: string): Promise<void> {
        try { return await this.downloadTo(url, filePath); }
        catch (error) {
            this.retries.set(filePath, (this.retries.get(filePath) ?? 0) + 1);
            if (this.retries.get(filePath)! > this.retryLimit) {
                fs.unlink(filePath, _ => {});
                throw error;
            }
            console.warn(`Download of ${url} failed, retrying. (error: ${error})`);
            await wait(Math.floor(Math.random() * this.maxRetryDelay));
            return this.downloadWithRetries(url, filePath);
        }
    }

    private async downloadTo(url: string, filePath: string): Promise<void> {
        // noinspection JSUnusedGlobalSymbols
        const response = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: this.timeoutSeconds * 1000,
            timeoutErrorMessage: `Failed to download ${url}: timeout > ${this.timeoutSeconds} seconds.`,
            validateStatus: status => (status >= 200 && status < 300) || status === 429
        });

        if (response.status === 429) {
            const delay = response.headers["retry-after"];
            if (typeof delay !== "number") throw Error(`${url}: 429 without retry-after header.`);
            console.warn(`Too many download requests; the host asked to wait ${delay} seconds.`);
            await wait(delay + 1);
            return await this.downloadTo(url, filePath);
        }

        await afs.writeFile(filePath, response.data);
    }
}

function wait(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

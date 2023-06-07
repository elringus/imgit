/** Handles resolving size of media files, like images and video. */
export interface MediaResolver {
    /**
     * Resolves width and height of the specified image or video file.
     * @remarks Concurrent requests for same files are queued and results are cached.
     * @param filePath Full file system path of the media file.
     */
    resolve(filePath: string): Promise<MediaSize>;
}

export type MediaSize = {
    width: number;
    height: number;
}

type MediaInfo = {
    streams: MediaStream[];
}

type MediaStream = {
    index: number;
    width: number;
    height: number;
}

export class DefaultMediaResolver implements MediaResolver {
    private readonly resolves = new Map<string, Promise<MediaSize>>;

    public async resolve(filePath: string) {
        if (this.resolves.has(filePath))
            return this.resolves.get(filePath)!;
        this.resolves.set(filePath, resolveSizes(filePath));
        return await this.resolves.get(filePath)!;
    }
}

async function resolveSizes(filePath: string): Promise<MediaSize> {
    const info = await require("ffprobe")(filePath, { path: require("ffprobe-static").path }) as MediaInfo;
    return { width: info?.streams[0].width ?? 0, height: info?.streams[0].height ?? 0 };
}

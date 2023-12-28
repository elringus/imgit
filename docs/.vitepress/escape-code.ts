import { Plugin, stages, CapturedAsset } from "imgit/server";

export default { capture } satisfies Plugin;

type Range = { start: number; end: number };

// Remove captures inside Markdown code blocks (```code```).
function capture(content: string, assets: CapturedAsset[]): boolean {
    stages.capture.capture(content, assets);
    const ranges = findCodeRanges(content);
    assets.splice(0, assets.length, ...assets.filter(a => !isInCodeBlock(a, ranges)));
    return true;
}

function findCodeRanges(content: string): Range[] {
    const ranges = new Array<Range>();
    let tickCount = 0;
    let openIndex = -1;
    for (let i = 0; i < content.length; i++)
        if (content[i] === "`") handleTick(i);
    return ranges;

    function handleTick(index: number) {
        if (++tickCount < 3) return;
        if (openIndex === -1) openRange(index);
        else closeRange(index);
    }

    function openRange(index: number) {
        openIndex = index;
        tickCount = 0;
    }

    function closeRange(index: number) {
        ranges.push({ start: openIndex, end: index });
        openIndex = -1;
        tickCount = 0;
    }
}

function isInCodeBlock(asset: CapturedAsset, ranges: Range[]): boolean {
    for (const range of ranges)
        if (asset.syntax.index >= range.start &&
            (asset.syntax.index + asset.syntax.text.length) <= range.end)
            return true;
    return false;
}

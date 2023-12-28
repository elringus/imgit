import { Plugin, CapturedAsset, stages } from "imgit/server";

type Range = { start: number; end: number; };

export default { capture } satisfies Plugin;

// Remove captures inside Markdown code blocks (```code```).
function capture(content: string, assets: CapturedAsset[]): boolean {
    stages.capture.capture(content, assets);
    if (assets.length === 0) return true;
    const ranges = findCodeRanges(content);
    if (ranges.length > 0)
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

    function handleTick(index: number): void {
        if (++tickCount < 3) return;
        if (openIndex === -1) openRange(index);
        else closeRange(index);
    }

    function openRange(index: number): void {
        openIndex = index;
        tickCount = 0;
    }

    function closeRange(index: number): void {
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

import { it, expect, vi } from "vitest";
import { boot } from "./common.js";
import { isImgitAssetImport, importImgitAsset } from "../../src/server/import.js";
import { ContentInfo, EncodedContent } from "../../src/server/index.js";

it("assumes imgit import when starts with imgit:", async () => {
    expect(isImgitAssetImport("foo")).toBeFalsy();
    expect(isImgitAssetImport("imgit:foo")).toBeTruthy();
});

it("invokes build pipeline when importing imgit asset", async () => {
    const info: ContentInfo = { alpha: true, width: 7, height: 6, type: "foo" };
    const content: EncodedContent = { info, src: "", encoded: "bar", dense: "baz", local: "" };
    const asset = { content };
    vi.spyOn(await import("../../src/server/transform/index.js"), "stages", "get").mockReturnValue({
        capture: { assets: vi.fn() },
        resolve: { asset: vi.fn(), spec: vi.fn() },
        fetch: { asset: vi.fn() },
        probe: { asset: vi.fn() },
        encode: { asset: vi.fn(async input => void Object.assign(input, asset)) },
        build: {
            asset: vi.fn(),
            source: vi.fn(path => path),
            size: vi.fn(() => ({ width: 1, height: 2 })),
            CONTAINER_ATTR: ""
        },
        rewrite: { content: vi.fn() }
    });
    await boot();
    const code = await importImgitAsset("imgit:foo");
    expect(code).toStrictEqual(`export default {
                content: {
                    encoded: "bar",
                    dense: "baz",
                    cover: undefined,
                    safe: undefined
                },
                info: {
                    type: "foo",
                    height: 2,
                    width: 1,
                    alpha: true
                }
            }`);
});

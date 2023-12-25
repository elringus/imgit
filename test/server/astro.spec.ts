import { it, expect, vi } from "vitest";
import astro from "../../src/plugin/astro.js";
import youtube from "../../src/plugin/youtube/index.js";

it("injects vite plugin", async () => {
    const hook = astro().hooks["astro:config:setup"]!;
    const updateConfig = vi.fn();
    await hook({ updateConfig: <never>updateConfig, injectScript: vi.fn() });
    expect(updateConfig).toBeCalledWith({ vite: expect.anything() });
});

it("injects main client module and styles", async () => {
    const hook = astro().hooks["astro:config:setup"]!;
    const injectScript = vi.fn();
    await hook({ updateConfig: vi.fn(), injectScript });
    expect(injectScript).toBeCalledWith("page", expect.stringContaining("imgit/src/client/index.js"));
    expect(injectScript).toBeCalledWith("page", expect.stringContaining("imgit/src/client/styles.css"));
});

it("injects plugin client modules and styles", async () => {
    const hook = astro({ plugins: [youtube()] }).hooks["astro:config:setup"]!;
    const injectScript = vi.fn();
    await hook({ updateConfig: vi.fn(), injectScript });
    expect(injectScript).toBeCalledWith("page", expect.stringContaining("imgit/src/plugin/youtube/client.js"));
    expect(injectScript).toBeCalledWith("page", expect.stringContaining("imgit/src/plugin/youtube/styles.css"));
});

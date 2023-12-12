import { describe, it, expect, vi } from "vitest";

describe("index", () => {
    it("observes mutations on import", async () => {
        const observe = vi.spyOn(await import("../src/client/mutation.js"), "observeMutations");
        await import("../src/client/index.js");
        expect(observe).toHaveBeenCalled();
    });
});

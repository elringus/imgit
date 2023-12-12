import { describe, it, expect, spyOn } from "bun:test";

describe("index", () => {
    it("observes mutations on import", async () => {
        const observe = spyOn(await import("../src/client/mutation.js"), "observeMutations");
        await import("../src/client/index.js");
        expect(observe).toHaveBeenCalled();
    });
});

﻿import { it, vi, expect } from "vitest";

it("observes mutations on import", async () => {
    const observe = vi.spyOn(await import("../../src/client/mutation.js"), "observeMutations");
    await import("../../src/client/index.js");
    expect(observe).toBeCalled();
});

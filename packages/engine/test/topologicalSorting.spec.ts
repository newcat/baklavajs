import { IConnection } from "@baklavajs/core";
import { TestNode } from "./testNode";
import { containsCycle, CycleError, sortTopologically } from "../src";

describe("Topological Sorting", () => {
    it("detects a cycle", () => {
        const n1 = new TestNode();
        const n2 = new TestNode();
        const conn1: IConnection = { id: "a", from: n1.outputs.c, to: n2.inputs.a };
        const conn2: IConnection = { id: "b", from: n2.outputs.c, to: n1.inputs.a };

        expect(() => sortTopologically([n1, n2], [conn1, conn2])).toThrowError(CycleError);
        expect(containsCycle([n1, n2], [conn1, conn2])).toBe(true);
    });
});

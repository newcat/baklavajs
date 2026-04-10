import { describe, expect, it } from "vitest";
import { defineNode, Editor, NodeInterface } from "@baklavajs/core";
import { ForwardEngine, ForwardCalculationContext } from "../src/forwardEngine";
import { ExecutionFlowInterface } from "../src/executionFlow";

// Helper: a node with exec in/out and data in/out (adds a + b -> result)
const ExecNode = defineNode({
    type: "ExecNode",
    inputs: {
        execIn: () => new ExecutionFlowInterface("ExecIn"),
        a: () => new NodeInterface("A", 0),
        b: () => new NodeInterface("B", 0),
    },
    outputs: {
        execOut: () => new ExecutionFlowInterface("ExecOut"),
        result: () => new NodeInterface("Result", 0),
    },
    calculate({ a, b }) {
        return { execOut: true, result: a + b };
    },
});

// Helper: a pure data node (no exec ports) — multiplies input by 2
const DataNode = defineNode({
    type: "DataNode",
    inputs: {
        value: () => new NodeInterface("Value", 5),
    },
    outputs: {
        out: () => new NodeInterface("Out", 0),
    },
    calculate({ value }) {
        return { out: value * 2 };
    },
});

// Helper: a branch node that conditionally activates one exec path
const BranchNode = defineNode({
    type: "BranchNode",
    inputs: {
        execIn: () => new ExecutionFlowInterface("ExecIn"),
        condition: () => new NodeInterface("Condition", false),
    },
    outputs: {
        trueExec: () => new ExecutionFlowInterface("True"),
        falseExec: () => new ExecutionFlowInterface("False"),
    },
    calculate({ condition }) {
        return { trueExec: !!condition, falseExec: !condition };
    },
});

// Helper: a trigger node (exec out only, no exec in)
const TriggerNode = defineNode({
    type: "TriggerNode",
    inputs: {},
    outputs: {
        execOut: () => new ExecutionFlowInterface("ExecOut"),
        value: () => new NodeInterface("Value", 42),
    },
    calculate() {
        return { execOut: true, value: 42 };
    },
});

// Helper: a collector node that records how many times it was calculated
let collectCount = 0;
const CollectorNode = defineNode({
    type: "CollectorNode",
    inputs: {
        execIn: () => new ExecutionFlowInterface("ExecIn"),
        data: () => new NodeInterface("Data", 0),
    },
    outputs: {
        execOut: () => new ExecutionFlowInterface("ExecOut"),
        result: () => new NodeInterface("Result", 0),
    },
    calculate({ data }) {
        collectCount++;
        return { execOut: true, result: data };
    },
});

// Helper: a ForLoop node that uses executeOutput to fire the loop body multiple times
const ForLoopNode = defineNode({
    type: "ForLoopNode",
    inputs: {
        execIn: () => new ExecutionFlowInterface("ExecIn"),
        start: () => new NodeInterface("Start", 0),
        end: () => new NodeInterface("End", 3),
    },
    outputs: {
        loopBody: () => new ExecutionFlowInterface("LoopBody"),
        completed: () => new ExecutionFlowInterface("Completed"),
        index: () => new NodeInterface("Index", 0),
    },
    async calculate({ start, end }, context) {
        const { executeOutput } = context as ForwardCalculationContext;
        for (let i = start; i < end; i++) {
            await executeOutput("loopBody", { index: i });
        }
        return { loopBody: false, completed: true, index: end };
    },
});

describe("ForwardEngine", () => {
    it("executes a simple exec chain", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();
        const node1 = new ExecNode();
        const node2 = new ExecNode();
        [trigger, node1, node2].forEach((n) => e.graph.addNode(n));

        // trigger -> node1 -> node2 (exec flow)
        e.graph.addConnection(trigger.outputs.execOut, node1.inputs.execIn);
        e.graph.addConnection(node1.outputs.execOut, node2.inputs.execIn);

        // Set data values
        node1.inputs.a.value = 3;
        node1.inputs.b.value = 7;
        node2.inputs.a.value = 10;
        node2.inputs.b.value = 20;

        const engine = new ForwardEngine(e);
        const result = (await engine.runOnce(undefined, trigger, undefined))!;

        expect(result).not.toBeNull();
        expect(result.size).toBe(3);

        // Trigger node
        expect(Object.fromEntries(result.get(trigger.id)!)).toEqual({ execOut: true, value: 42 });

        // Node1: 3 + 7 = 10
        expect(result.get(node1.id)!.get("result")).toBe(10);

        // Node2: 10 + 20 = 30
        expect(result.get(node2.id)!.get("result")).toBe(30);
    });

    it("supports branching - true path", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();
        const branch = new BranchNode();
        const trueNode = new ExecNode();
        const falseNode = new ExecNode();
        [trigger, branch, trueNode, falseNode].forEach((n) => e.graph.addNode(n));

        e.graph.addConnection(trigger.outputs.execOut, branch.inputs.execIn);
        e.graph.addConnection(branch.outputs.trueExec, trueNode.inputs.execIn);
        e.graph.addConnection(branch.outputs.falseExec, falseNode.inputs.execIn);

        branch.inputs.condition.value = true;
        trueNode.inputs.a.value = 1;
        trueNode.inputs.b.value = 2;
        falseNode.inputs.a.value = 100;
        falseNode.inputs.b.value = 200;

        const engine = new ForwardEngine(e);
        const result = (await engine.runOnce(undefined, trigger, undefined))!;

        // True path was taken
        expect(result.has(trueNode.id)).toBe(true);
        expect(result.get(trueNode.id)!.get("result")).toBe(3);

        // False path was NOT taken
        expect(result.has(falseNode.id)).toBe(false);
    });

    it("supports branching - false path", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();
        const branch = new BranchNode();
        const trueNode = new ExecNode();
        const falseNode = new ExecNode();
        [trigger, branch, trueNode, falseNode].forEach((n) => e.graph.addNode(n));

        e.graph.addConnection(trigger.outputs.execOut, branch.inputs.execIn);
        e.graph.addConnection(branch.outputs.trueExec, trueNode.inputs.execIn);
        e.graph.addConnection(branch.outputs.falseExec, falseNode.inputs.execIn);

        branch.inputs.condition.value = false;
        falseNode.inputs.a.value = 100;
        falseNode.inputs.b.value = 200;

        const engine = new ForwardEngine(e);
        const result = (await engine.runOnce(undefined, trigger, undefined))!;

        // True path was NOT taken
        expect(result.has(trueNode.id)).toBe(false);

        // False path was taken
        expect(result.has(falseNode.id)).toBe(true);
        expect(result.get(falseNode.id)!.get("result")).toBe(300);
    });

    it("pulls data from a pure data node (backward resolution)", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();
        const dataNode = new DataNode();
        const execNode = new ExecNode();
        [trigger, dataNode, execNode].forEach((n) => e.graph.addNode(n));

        // Exec flow: trigger -> execNode
        e.graph.addConnection(trigger.outputs.execOut, execNode.inputs.execIn);

        // Data flow: dataNode.out -> execNode.a (backward pull)
        e.graph.addConnection(dataNode.outputs.out, execNode.inputs.a);

        dataNode.inputs.value.value = 7;
        execNode.inputs.b.value = 3;

        const engine = new ForwardEngine(e);
        const result = (await engine.runOnce(undefined, trigger, undefined))!;

        // dataNode: 7 * 2 = 14
        // execNode: 14 + 3 = 17
        expect(result.get(execNode.id)!.get("result")).toBe(17);
    });

    it("allows re-execution of nodes reached via multiple exec paths", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();

        const SplitNode = defineNode({
            type: "SplitNode",
            inputs: {
                execIn: () => new ExecutionFlowInterface("ExecIn"),
            },
            outputs: {
                execA: () => new ExecutionFlowInterface("ExecA"),
                execB: () => new ExecutionFlowInterface("ExecB"),
            },
            calculate() {
                return { execA: true, execB: true };
            },
        });

        const split = new SplitNode();
        collectCount = 0;
        const collector = new CollectorNode();
        [trigger, split, collector].forEach((n) => e.graph.addNode(n));

        // trigger -> split -> (execA, execB) -> collector
        e.graph.addConnection(trigger.outputs.execOut, split.inputs.execIn);
        e.graph.addConnection(split.outputs.execA, collector.inputs.execIn);
        e.graph.addConnection(split.outputs.execB, collector.inputs.execIn);

        const engine = new ForwardEngine(e);
        await engine.runOnce(undefined, trigger, undefined);

        // Collector should have been executed twice (once from each exec path)
        expect(collectCount).toBe(2);
    });

    it("chains data through exec nodes", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();
        const node1 = new ExecNode();
        const node2 = new ExecNode();
        [trigger, node1, node2].forEach((n) => e.graph.addNode(n));

        // Exec flow: trigger -> node1 -> node2
        e.graph.addConnection(trigger.outputs.execOut, node1.inputs.execIn);
        e.graph.addConnection(node1.outputs.execOut, node2.inputs.execIn);

        // Data: trigger.value -> node1.a, node1.result -> node2.a
        e.graph.addConnection(trigger.outputs.value, node1.inputs.a);
        e.graph.addConnection(node1.outputs.result, node2.inputs.a);

        node1.inputs.b.value = 8;
        node2.inputs.b.value = 5;

        const engine = new ForwardEngine(e);
        const result = (await engine.runOnce(undefined, trigger, undefined))!;

        // trigger: value = 42
        // node1: 42 + 8 = 50
        expect(result.get(node1.id)!.get("result")).toBe(50);

        // node2 pulls node1.result (50) + 5 = 55
        expect(result.get(node2.id)!.get("result")).toBe(55);
    });

    it("pulls chained data nodes", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();
        const data1 = new DataNode();
        const data2 = new DataNode();
        const execNode = new ExecNode();
        [trigger, data1, data2, execNode].forEach((n) => e.graph.addNode(n));

        // Exec flow: trigger -> execNode
        e.graph.addConnection(trigger.outputs.execOut, execNode.inputs.execIn);

        // Data chain: data1.out -> data2.value, data2.out -> execNode.a
        e.graph.addConnection(data1.outputs.out, data2.inputs.value);
        e.graph.addConnection(data2.outputs.out, execNode.inputs.a);

        data1.inputs.value.value = 3;
        execNode.inputs.b.value = 1;

        const engine = new ForwardEngine(e);
        const result = (await engine.runOnce(undefined, trigger, undefined))!;

        // data1: 3 * 2 = 6
        // data2: 6 * 2 = 12
        // execNode: 12 + 1 = 13
        expect(result.get(execNode.id)!.get("result")).toBe(13);
    });

    it("executes a for loop using executeOutput", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();
        const loop = new ForLoopNode();
        collectCount = 0;
        const collector = new CollectorNode();
        [trigger, loop, collector].forEach((n) => e.graph.addNode(n));

        // Exec: trigger -> loop, loop.loopBody -> collector
        e.graph.addConnection(trigger.outputs.execOut, loop.inputs.execIn);
        e.graph.addConnection(loop.outputs.loopBody, collector.inputs.execIn);

        loop.inputs.start.value = 0;
        loop.inputs.end.value = 5;

        const engine = new ForwardEngine(e);
        await engine.runOnce(undefined, trigger, undefined);

        // Loop body should have fired 5 times (indices 0..4)
        expect(collectCount).toBe(5);
    });

    it("loop body nodes can read the current index via data connection", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();
        const loop = new ForLoopNode();

        // Track all index values seen by the body node
        const seenIndices: number[] = [];
        const BodyNode = defineNode({
            type: "BodyNode",
            inputs: {
                execIn: () => new ExecutionFlowInterface("ExecIn"),
                index: () => new NodeInterface("Index", -1),
            },
            outputs: {
                execOut: () => new ExecutionFlowInterface("ExecOut"),
                result: () => new NodeInterface("Result", 0),
            },
            calculate({ index }) {
                seenIndices.push(index);
                return { execOut: true, result: index * 10 };
            },
        });

        const body = new BodyNode();
        [trigger, loop, body].forEach((n) => e.graph.addNode(n));

        // Exec: trigger -> loop, loop.loopBody -> body
        e.graph.addConnection(trigger.outputs.execOut, loop.inputs.execIn);
        e.graph.addConnection(loop.outputs.loopBody, body.inputs.execIn);

        // Data: loop.index -> body.index
        e.graph.addConnection(loop.outputs.index, body.inputs.index);

        loop.inputs.start.value = 2;
        loop.inputs.end.value = 6;

        const engine = new ForwardEngine(e);
        await engine.runOnce(undefined, trigger, undefined);

        // Body should have seen indices 2, 3, 4, 5
        expect(seenIndices).toEqual([2, 3, 4, 5]);
    });

    it("loop completed exec output fires after the loop", async () => {
        const e = new Editor();
        const trigger = new TriggerNode();
        const loop = new ForLoopNode();
        const afterLoop = new ExecNode();
        collectCount = 0;
        const bodyCollector = new CollectorNode();
        [trigger, loop, bodyCollector, afterLoop].forEach((n) => e.graph.addNode(n));

        // Exec: trigger -> loop, loop.loopBody -> bodyCollector, loop.completed -> afterLoop
        e.graph.addConnection(trigger.outputs.execOut, loop.inputs.execIn);
        e.graph.addConnection(loop.outputs.loopBody, bodyCollector.inputs.execIn);
        e.graph.addConnection(loop.outputs.completed, afterLoop.inputs.execIn);

        loop.inputs.start.value = 0;
        loop.inputs.end.value = 3;
        afterLoop.inputs.a.value = 100;
        afterLoop.inputs.b.value = 200;

        const engine = new ForwardEngine(e);
        const result = (await engine.runOnce(undefined, trigger, undefined))!;

        // Loop body ran 3 times
        expect(collectCount).toBe(3);

        // "Completed" node ran after the loop
        expect(result.has(afterLoop.id)).toBe(true);
        expect(result.get(afterLoop.id)!.get("result")).toBe(300);
    });

    it("executeOutput skips automatic firing for manually executed outputs", async () => {
        // The ForLoopNode returns loopBody: false, so the engine should NOT
        // fire loopBody again after calculate returns
        const e = new Editor();
        const trigger = new TriggerNode();
        const loop = new ForLoopNode();
        collectCount = 0;
        const collector = new CollectorNode();
        [trigger, loop, collector].forEach((n) => e.graph.addNode(n));

        e.graph.addConnection(trigger.outputs.execOut, loop.inputs.execIn);
        e.graph.addConnection(loop.outputs.loopBody, collector.inputs.execIn);

        loop.inputs.start.value = 0;
        loop.inputs.end.value = 2;

        const engine = new ForwardEngine(e);
        await engine.runOnce(undefined, trigger, undefined);

        // Should be exactly 2 (from executeOutput), not 3 (if engine also fired it)
        expect(collectCount).toBe(2);
    });
});

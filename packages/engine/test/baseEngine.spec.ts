import { describe, expect, it, vi } from "vitest";
import { Graph, AbstractNode, INodeUpdateEventData, Editor, CalculationResult } from "@baklavajs/core";
import { BaseEngine } from "../src";
import { TestNode } from "./testNode";

class MockEngine extends BaseEngine<void, []> {
    public runGraphSpy = vi.fn();
    public getInputValuesSpy = vi.fn();
    public executeSpy = vi.fn();
    public onChangeSpy = vi.fn();

    public runGraph(graph: Graph, inputs: Map<string, any>, calculationData: void): Promise<CalculationResult> {
        this.runGraphSpy(graph, inputs, calculationData);
        return Promise.resolve(new Map());
    }

    public override getInputValues(graph: Graph): Map<string, any> {
        this.getInputValuesSpy(graph);
        return new Map();
    }

    protected execute(calculationData: void): Promise<CalculationResult> {
        this.executeSpy(calculationData);
        return Promise.resolve(new Map());
    }

    protected onChange(
        recalculateOrder: boolean,
        updatedNode?: AbstractNode | undefined,
        data?: INodeUpdateEventData | undefined,
    ): void {
        this.onChangeSpy(recalculateOrder, updatedNode, data);
    }
}

describe("BaseEngine", () => {
    it("triggers onChange when its running and a node is being updated", () => {
        const editor = new Editor();
        const engine = new MockEngine(editor);
        const n1 = editor.graph.addNode(new TestNode())!;
        engine["recalculateOrder"] = false;

        n1.inputs.a.value = 10;
        expect(engine.onChangeSpy).not.toHaveBeenCalled();

        engine.start();
        n1.inputs.a.value = 4;
        expect(engine.onChangeSpy).toHaveBeenCalledWith<Parameters<MockEngine["onChange"]>>(false, n1, {
            intf: n1.inputs.a,
            name: "a",
            type: "input",
        });
    });

    it("triggers onChange when its running and a node is being added", () => {
        const editor = new Editor();
        const engine = new MockEngine(editor);
        engine["recalculateOrder"] = false;

        editor.graph.addNode(new TestNode())!;
        expect(engine.onChangeSpy).not.toHaveBeenCalled();

        engine.start();
        editor.graph.addNode(new TestNode())!;
        expect(engine.onChangeSpy).toHaveBeenCalledWith<Parameters<MockEngine["onChange"]>>(true, undefined, undefined);
    });

    it("triggers onChange when its running and a node is being removed", () => {
        const editor = new Editor();
        const engine = new MockEngine(editor);
        engine["recalculateOrder"] = false;
        const n1 = editor.graph.addNode(new TestNode())!;
        const n2 = editor.graph.addNode(new TestNode())!;

        editor.graph.removeNode(n1);
        expect(engine.onChangeSpy).not.toHaveBeenCalled();

        engine.start();
        editor.graph.removeNode(n2);
        expect(engine.onChangeSpy).toHaveBeenCalledWith<Parameters<MockEngine["onChange"]>>(true, undefined, undefined);
    });

    it("triggers onChange when its running and a connection is being added", () => {
        const editor = new Editor();
        const engine = new MockEngine(editor);
        engine["recalculateOrder"] = false;
        const n1 = editor.graph.addNode(new TestNode())!;
        const n2 = editor.graph.addNode(new TestNode())!;

        editor.graph.addConnection(n1.outputs.c, n2.inputs.a);
        expect(engine.onChangeSpy).not.toHaveBeenCalled();

        engine.start();
        editor.graph.addConnection(n1.outputs.d, n2.inputs.b);
        expect(engine.onChangeSpy).toHaveBeenCalledWith<Parameters<MockEngine["onChange"]>>(true, undefined, undefined);
    });

    it("triggers onChange when its running and a connection is being removed", () => {
        const editor = new Editor();
        const engine = new MockEngine(editor);
        engine["recalculateOrder"] = false;
        const n1 = editor.graph.addNode(new TestNode())!;
        const n2 = editor.graph.addNode(new TestNode())!;
        const conn1 = editor.graph.addConnection(n1.outputs.c, n2.inputs.a)!;
        const conn2 = editor.graph.addConnection(n1.outputs.d, n2.inputs.b)!;

        editor.graph.removeConnection(conn1);
        expect(engine.onChangeSpy).not.toHaveBeenCalled();

        engine.start();
        editor.graph.removeConnection(conn2);
        expect(engine.onChangeSpy).toHaveBeenCalledWith<Parameters<MockEngine["onChange"]>>(true, undefined, undefined);
    });

    it("prevents connection from a node to itself", () => {
        const editor = new Editor();
        new MockEngine(editor);
        const n1 = editor.graph.addNode(new TestNode())!;
        const conn = editor.graph.addConnection(n1.outputs.c, n1.inputs.a);
        expect(conn).toBeUndefined();
    });

    it("prevents cyclic connections", () => {
        const editor = new Editor();
        new MockEngine(editor);
        const n1 = editor.graph.addNode(new TestNode())!;
        const n2 = editor.graph.addNode(new TestNode())!;
        editor.graph.addConnection(n1.outputs.c, n2.inputs.a);
        const conn2 = editor.graph.addConnection(n2.outputs.c, n1.inputs.a);
        expect(conn2).toBeUndefined();
    });
});

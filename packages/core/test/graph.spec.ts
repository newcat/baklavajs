import { Editor } from "../src";
import OutputNode from "./OutputNode";
import TestNode from "./TestNode";

describe("Graph", () => {
    it("can add a node", () => {
        const e = new Editor();
        const n = new TestNode();
        const r = e.graph.addNode(n);
        expect(r).toEqual(n);
        expect(e.graph.nodes[0]).toEqual(n);
    });

    it("calls the onPlaced function of a node", () => {
        const e = new Editor();
        const n = new TestNode();
        const onPlacedSpy = jest.fn();
        n.onPlaced = onPlacedSpy;
        e.graph.addNode(n);
        expect(n.registerCalled).toBeTruthy();
        expect(onPlacedSpy).toHaveBeenCalled();
    });

    it("can remove a node", () => {
        const e = new Editor();
        const n = new TestNode();
        const onDestroySpy = jest.fn();
        n.onDestroy = onDestroySpy;
        e.graph.addNode(n);
        expect(e.graph.nodes).toHaveLength(1);
        e.graph.removeNode(n);
        expect(e.graph.nodes).toHaveLength(0);
        expect(onDestroySpy).toHaveBeenCalled();
    });

    it("can add a connection", () => {
        const e = new Editor();
        const n1 = e.graph.addNode(new TestNode())!;
        const n2 = e.graph.addNode(new OutputNode())!;
        const c = e.graph.addConnection(n1.outputs.b, n2.inputs.input)!;
        expect(e.graph.connections).toHaveLength(1);
        expect(e.graph.connections[0]).toEqual(c);
        expect(c.from).toEqual(n1.outputs.b);
        expect(c.to).toEqual(n2.inputs.input);
    });

    it("can remove a connection", () => {
        const e = new Editor();
        const n1 = e.graph.addNode(new TestNode())!;
        const n2 = e.graph.addNode(new OutputNode())!;
        const c = e.graph.addConnection(n1.outputs.b, n2.inputs.input);
        expect(e.graph.connections).toHaveLength(1);
        e.graph.removeConnection(c!);
        expect(e.graph.connections).toHaveLength(0);
        expect(c!.destructed).toBeTruthy();
    });

    it("does allow regular connections even if an input is connected to an output", () => {
        const e = new Editor();
        const n1 = e.graph.addNode(new TestNode())!;
        const n2 = e.graph.addNode(new OutputNode())!;
        expect(e.graph.checkConnection(n2.inputs.input, n1.outputs.b)).toBeTruthy();
        expect(e.graph.addConnection(n2.inputs.input, n1.outputs.b)).toBeTruthy();
    });

    it("does not allow connections where source and target are the same node", () => {
        const e = new Editor();
        const n = e.graph.addNode(new TestNode())!;
        const if1 = n.outputs.b;
        const if2 = n.inputs.a;
        expect(e.graph.checkConnection(if1, if2)).toEqual({ connectionAllowed: false });
        expect(e.graph.addConnection(if1, if2)).toBeUndefined();
    });
});

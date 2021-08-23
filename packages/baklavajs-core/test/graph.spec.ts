import { expect } from "chai";
import { spy, SinonSpy } from "sinon";
import { Editor } from "../src";
import OutputNode from "./OutputNode";
import TestNode from "./TestNode";

describe("Graph", () => {
    it("can add a node", () => {
        const e = new Editor();
        const n = new TestNode();
        const r = e.graph.addNode(n);
        expect(r).to.equal(n);
        expect(e.graph.nodes[0]).to.equal(n);
    });

    it("calls the onPlaced function of a node", () => {
        const e = new Editor();
        const n = new TestNode();
        n.onPlaced = spy();
        e.graph.addNode(n);
        expect(n.registerCalled).to.be.true;
        expect((n.onPlaced as SinonSpy).called).to.be.true;
    });

    it("can remove a node", () => {
        const e = new Editor();
        const n = new TestNode();
        n.onDestroy = spy();
        e.graph.addNode(n);
        expect(e.graph.nodes).to.have.lengthOf(1);
        e.graph.removeNode(n);
        expect(e.graph.nodes).to.have.lengthOf(0);
        expect((n.onDestroy as SinonSpy).called).to.be.true;
    });

    it("can add a connection", () => {
        const e = new Editor();
        const n1 = e.graph.addNode(new TestNode())!;
        const n2 = e.graph.addNode(new OutputNode())!;
        const c = e.graph.addConnection(n1.outputs.b, n2.inputs.input)!;
        expect(e.graph.connections).to.have.lengthOf(1);
        expect(e.graph.connections[0]).to.equal(c);
        expect(c.from).to.equal(n1.outputs.b);
        expect(c.to).to.equal(n2.inputs.input);
    });

    it("can remove a connection", () => {
        const e = new Editor();
        const n1 = e.graph.addNode(new TestNode())!;
        const n2 = e.graph.addNode(new OutputNode())!;
        const c = e.graph.addConnection(n1.outputs.b, n2.inputs.input);
        expect(e.graph.connections).to.have.lengthOf(1);
        e.graph.removeConnection(c!);
        expect(e.graph.connections).to.have.lengthOf(0);
        expect(c!.destructed).to.be.true;
    });

    it("does allow regular connections even if an input is connected to an output", () => {
        const e = new Editor();
        const n1 = e.graph.addNode(new TestNode())!;
        const n2 = e.graph.addNode(new OutputNode())!;
        expect(e.graph.checkConnection(n2.inputs.input, n1.outputs.b)).to.not.be.false;
        expect(e.graph.addConnection(n2.inputs.input, n1.outputs.b)).to.not.be.undefined;
    });

    it("does not allow connections where source and target are the same node", () => {
        const e = new Editor();
        const n = e.graph.addNode(new TestNode())!;
        const if1 = n.outputs.b;
        const if2 = n.inputs.a;
        expect(e.graph.checkConnection(if1, if2)).to.be.false;
        expect(e.graph.addConnection(if1, if2)).to.be.undefined;
    });
});

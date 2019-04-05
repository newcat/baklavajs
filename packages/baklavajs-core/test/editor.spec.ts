import { expect } from "chai";
import { Editor } from "../src";
import TestNode from "./TestNode";
import OutputNode from "./OutputNode";

describe("Editor", () => {

    it("can construct", () => {
        expect(new Editor()).to.not.be.null;
    });

    it("can register a new node type", () => {
        const e = new Editor();
        e.registerNodeType("testnode", TestNode);
        e.registerNodeType("withcategory", TestNode, "testcategory");
        expect(e.nodeCategories.get("testcategory")![0]).to.equal("withcategory");
        expect(e.nodeTypes.get("testnode")).to.equal(TestNode);
        expect(e.nodeTypes.get("withcategory")).to.equal(TestNode);
    });

    it("can add a node", () => {
        const e = new Editor();
        const n = new TestNode();
        const r = e.addNode(n);
        expect(r).to.equal(n);
        expect(e.nodes[0]).to.equal(n);
    });

    it("calls the register function of a node", () => {
        const e = new Editor();
        const n = new TestNode();
        e.addNode(n);
        expect(n.registerCalled).to.be.true;
    });

    it("can remove a node", () => {
        const e = new Editor();
        const n = new TestNode();
        e.addNode(n);
        expect(e.nodes).to.have.lengthOf(1);
        e.removeNode(n);
        expect(e.nodes).to.have.lengthOf(0);
    });

    it("can add a connection", () => {
        const e = new Editor();
        const n1 = e.addNode(new TestNode())!;
        const n2 = e.addNode(new OutputNode())!;
        const c = e.addConnection(n1.getInterface("Output"), n2.getInterface("BooleanInput"));
        expect(e.connections).to.have.lengthOf(1);
        expect(e.connections[0]).to.equal(c);
        expect(c!.from).to.equal(n1.getInterface("Output"));
        expect(c!.to).to.equal(n2.getInterface("BooleanInput"));
    });

    it("can remove a connection", () => {
        const e = new Editor();
        const n1 = e.addNode(new TestNode())!;
        const n2 = e.addNode(new OutputNode())!;
        const c = e.addConnection(n1.getInterface("Output"), n2.getInterface("BooleanInput"));
        expect(e.connections).to.have.lengthOf(1);
        e.removeConnection(c!);
        expect(e.connections).to.have.lengthOf(0);
        expect(c!.destructed).to.be.true;
    });

    it("does allow regular connections even if an input is connected to an output", () => {
        const e = new Editor();
        const n1 = e.addNode(new TestNode())!;
        const n2 = e.addNode(new OutputNode())!;
        expect(e.checkConnection(n2.getInterface("BooleanInput"), n1.getInterface("Output"))).to.not.be.false;
        expect(e.addConnection(n2.getInterface("BooleanInput"), n1.getInterface("Output"))).to.not.be.undefined;
    });

    it("does not allow connections where source and target are the same node", () => {
        const e = new Editor();
        const n = e.addNode(new TestNode())!;
        const if1 = n.getInterface("Output");
        const if2 = n.getInterface("Input");
        expect(e.checkConnection(if1, if2)).to.be.false;
        expect(e.addConnection(if1, if2)).to.be.undefined;
    });

    it("can save and load a state"); // TODO

});

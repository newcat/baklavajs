import { Editor } from "../src";
import OutputNode from "./OutputNode";
import TestNode from "./TestNode";

describe("Editor", () => {
    it("can construct", () => {
        expect(new Editor()).toBeTruthy();
    });

    it("can register a new node type", () => {
        const e = new Editor();
        e.registerNodeType(TestNode);
        expect(e.nodeTypes.get("TestNode")).toEqual({
            category: "default",
            title: "TestNode",
            type: TestNode,
        });
    });

    it("can register a new node type with category and title", () => {
        const e = new Editor();
        e.registerNodeType(TestNode, {
            category: "category",
            title: "title",
        });
        expect(e.nodeTypes.get("TestNode")).toEqual({
            type: TestNode,
            category: "category",
            title: "title",
        });
    });

    it("can save and load a state", () => {
        const e = new Editor();
        e.registerNodeType(TestNode);
        e.registerNodeType(OutputNode);
        const n1 = e.graph.addNode(new TestNode())!;
        const n2 = e.graph.addNode(new OutputNode())!;
        e.graph.addConnection(n1.outputs.b, n2.inputs.input);

        const save1 = e.save();

        const e2 = new Editor();
        e2.registerNodeType(TestNode);
        e2.registerNodeType(OutputNode);
        e2.load(save1);

        expect(e2.save()).toEqual(save1);
    });
});

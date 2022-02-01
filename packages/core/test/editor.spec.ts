import { Editor } from "../src";
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

    it.todo("can save and load a state"); // TODO
});

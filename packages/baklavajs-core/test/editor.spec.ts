import { expect } from "chai";
import { Editor } from "../src";
import TestNode from "./TestNode";

describe("Editor", () => {
    it("can construct", () => {
        expect(new Editor()).to.not.be.null;
    });

    it("can register a new node type", () => {
        const e = new Editor();
        e.registerNodeType(TestNode);
        expect(e.nodeTypes.get("TestNode")).to.eql({
            type: TestNode,
        });
    });

    it("can register a new node type with category and title", () => {
        const e = new Editor();
        e.registerNodeType(TestNode, {
            category: "category",
            title: "title",
        });
        expect(e.nodeTypes.get("TestNode")).to.eql({
            type: TestNode,
            category: "category",
            title: "title",
        });
    });

    it("can save and load a state"); // TODO
});

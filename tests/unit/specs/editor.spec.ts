import { Editor } from "@/index";
import TestNode from "testimpl/TestNode";
import { expect } from "chai";

describe("Editor", () => {

    it("can construct", () => {
        expect(new Editor()).to.not.be.null;
    });

    it("can register a new node type", () => {
        const e = new Editor();
        e.registerNodeType("testnode", TestNode);
        e.registerNodeType("withcategory", TestNode, "testcategory");
        expect(e.nodeCategories.testcategory[0]).to.equal("withcategory");
        expect(e.nodeTypes.testnode).to.equal(TestNode);
        expect(e.nodeTypes.withcategory).to.equal(TestNode);
    });

});

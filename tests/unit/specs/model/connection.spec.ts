import { expect } from "chai";
import { NodeInterfaceTypeManager } from "@/model/nodeInterfaceTypeManager";
import { NodeInterface, Connection } from "@/index";
import TestNode from "testimpl/TestNode";

describe("Connection", () => {

    it("properly constructs and destructs", () => {
        const tm = new NodeInterfaceTypeManager();
        const node = new TestNode();
        const ni1 = new NodeInterface(node, false, "type1");
        ni1.value = "Test";
        const ni2 = new NodeInterface(node, true, "type1");
        const c = new Connection(ni1, ni2, tm);
        expect(ni1.connectionCount).to.equal(1);
        expect(ni2.connectionCount).to.equal(1);
        expect(!!c.id).to.be.true;
        expect(ni2.value).to.equal("Test");
        c.destruct();
        expect(ni1.connectionCount).to.equal(0);
        expect(ni2.connectionCount).to.equal(0);
    });

    it("transfers the value from one node interface to another", () => {
        const tm = new NodeInterfaceTypeManager();
        const node = new TestNode();
        const ni1 = new NodeInterface(node, false, "type1");
        const ni2 = new NodeInterface(node, true, "type1");
        const c = new Connection(ni1, ni2, tm);
        ni1.value = "Test";
        expect(ni2.value).to.equal("Test");
        c.destruct();
    });

    it("converts the type if necessary when transferring", () => {
        const tm = new NodeInterfaceTypeManager()
            .addType("type1", "white")
            .addType("type2", "yellow")
            .addConversion("type1", "type2", (v: string) => v + "xx");
        const node = new TestNode();
        const ni1 = new NodeInterface(node, false, "type1");
        const ni2 = new NodeInterface(node, true, "type2");
        const c = new Connection(ni1, ni2, tm);
        ni1.value = "Test";
        expect(ni2.value).to.equal("Testxx");
        c.destruct();
    });

});

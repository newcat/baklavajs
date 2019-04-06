import chai from "chai";
const expect = chai.expect;
import { NodeInterface, Connection } from "../src";
import TestNode from "./TestNode";

describe("Connection", () => {

    it("properly constructs and destructs", () => {
        const node = new TestNode();
        const ni1 = new NodeInterface(node, false);
        ni1.value = "Test";
        const ni2 = new NodeInterface(node, true);
        const c = new Connection(ni1, ni2);
        expect(ni1.connectionCount).to.equal(1);
        expect(ni2.connectionCount).to.equal(1);
        expect(!!c.id).to.be.true;
        c.destruct();
        expect(ni1.connectionCount).to.equal(0);
        expect(ni2.connectionCount).to.equal(0);
    });

});

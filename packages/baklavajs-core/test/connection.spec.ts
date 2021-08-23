import { expect } from "chai";
import { NodeInterface, Connection } from "../src";

describe("Connection", () => {
    it("properly constructs and destructs", () => {
        const ni1 = new NodeInterface("Ni1", "foo");
        const ni2 = new NodeInterface("Ni2", "bar");
        const c = new Connection(ni1, ni2);
        expect(ni1.connectionCount).to.equal(1);
        expect(ni2.connectionCount).to.equal(1);
        expect(!!c.id).to.be.true;
        c.destruct();
        expect(ni1.connectionCount).to.equal(0);
        expect(ni2.connectionCount).to.equal(0);
    });
});

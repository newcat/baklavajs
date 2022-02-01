import { NodeInterface, Connection, DummyConnection } from "../src";

describe("Connection", () => {
    it("properly constructs and destructs", () => {
        const ni1 = new NodeInterface("Ni1", "foo");
        const ni2 = new NodeInterface("Ni2", "bar");
        const c = new Connection(ni1, ni2);
        expect(ni1.connectionCount).toEqual(1);
        expect(ni2.connectionCount).toEqual(1);
        expect(c.id).toBeTruthy();
        c.destruct();
        expect(ni1.connectionCount).toEqual(0);
        expect(ni2.connectionCount).toEqual(0);
    });

    it("throws an error when trying to initialize with invalid interfaces", () => {
        const ni = new NodeInterface("Ni1", "foo");
        expect(() => new Connection(ni, undefined as any)).toThrow();
        expect(() => new Connection(undefined as any, ni)).toThrow();
    });
});

describe("DummyConnection", () => {
    it("doesn't increase connection count", () => {
        const ni1 = new NodeInterface("Ni1", "foo");
        const ni2 = new NodeInterface("Ni2", "bar");
        const c = new DummyConnection(ni1, ni2);
        expect(ni1.connectionCount).toEqual(0);
        expect(ni2.connectionCount).toEqual(0);
        expect(c.id).toBeTruthy();
    });

    it("throws an error when trying to initialize with invalid interfaces", () => {
        const ni = new NodeInterface("Ni1", "foo");
        expect(() => new DummyConnection(ni, undefined as any)).toThrow();
        expect(() => new DummyConnection(undefined as any, ni)).toThrow();
    });
});

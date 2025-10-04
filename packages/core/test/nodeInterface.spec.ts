import { describe, expect, it, vi } from "vitest";
import { NodeInterface } from "../src";

describe("Node Interface", () => {
    it("generates an id", () => {
        const ni = new NodeInterface("Test", "test");
        expect(ni.id).toBeTruthy();
    });

    it("can set and get the value", () => {
        const ni = new NodeInterface("Test", "test");
        ni.value = "myValue";
        expect(ni.value).toEqual("myValue");
    });

    it("calls the 'beforeSetValue' and 'setValue' events when a value is set", () => {
        const spy1 = vi.fn();
        const spy2 = vi.fn();
        const newValue = "myValue";
        const ni = new NodeInterface("Test", "test");
        ni.events.beforeSetValue.subscribe(Symbol(), spy1);
        ni.events.setValue.subscribe(Symbol(), spy2);
        ni.value = newValue;
        expect(spy1).toHaveBeenCalledTimes(1);
        expect(spy2).toHaveBeenCalledTimes(1);
        expect(spy1.mock.calls[0][0]).toEqual("myValue");
        expect(spy2.mock.calls[0][0]).toEqual("myValue");
    });

    it("correctly saves and loads a state", () => {
        const n1 = new NodeInterface("Test", 4);
        const save = n1.save();

        const n2 = new NodeInterface("Test", 1);
        n2.load(save);

        expect(n2.save()).toEqual(save);
    });

    it("allows to prevent setting a new value", () => {
        const n = new NodeInterface("Test", 1);
        n.events.beforeSetValue.subscribe(this, (_, prevent) => {
            prevent();
        });
        n.value = 10;
        expect(n.value).toEqual(1);
    });

    it("allows setting a component", () => {
        const n = new NodeInterface("Test", 1);
        expect(n.component).toBeUndefined();
        n.setComponent("myComponent");
        expect(n.component).toEqual("myComponent");
    });

    it("allows setting the port visibility", () => {
        const n = new NodeInterface("Test", 1);
        expect(n.port).toBeTruthy();
        n.setPort(false);
        expect(n.port).toBeFalsy();
    });

    it("allows setting the 'hidden' property", () => {
        const n = new NodeInterface("Test", 1);
        expect(n.hidden).toBeFalsy();
        n.setHidden(true);
        expect(n.hidden).toBeTruthy();
    });

    it("allows using middleware", () => {
        const n = new NodeInterface("Test", 1);
        const mw = vi.fn();
        n.use(mw, "hello", 3);
        expect(mw).toHaveBeenCalledWith(n, "hello", 3);
    });
});

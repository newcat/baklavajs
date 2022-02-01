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
        const spy1 = jest.fn();
        const spy2 = jest.fn();
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

    it.todo("correctly loads a state"); // TODO

    it.todo("correctly saves a state"); // TODO
});

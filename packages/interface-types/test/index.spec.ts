import { Editor } from "@baklavajs/core";
import { BaklavaInterfaceTypes, NodeInterfaceType } from "../src";

describe("BaklavaInterfaceTypes", () => {
    it("can add a type", () => {
        const e = new Editor();
        const nitm = new BaklavaInterfaceTypes(e);
        const nt = new NodeInterfaceType<string>("myType");
        nitm.addTypes(nt);
        expect(nitm["types"].size).toBe(1);
    });

    it("can add a conversion", () => {
        const nt1 = new NodeInterfaceType<string>("myType");
        const nt2 = new NodeInterfaceType<number>("type2");
        nt1.addConversion(nt2, (v) => Number(v));
        expect(nt1.conversions).toHaveLength(1);
        expect(nt2.conversions).toHaveLength(0);
    });

    it("can get a conversion", () => {
        const e = new Editor();
        const nitm = new BaklavaInterfaceTypes(e);
        const nt1 = new NodeInterfaceType<string>("myType");
        const nt2 = new NodeInterfaceType<number>("type2");
        nt1.addConversion(nt2, (v) => Number(v));
        nitm.addTypes(nt1, nt2);
        expect(nitm.getConversion("myType", "type2")).toBeTruthy();
    });

    it("correctly checks whether a type can be converted to another type", () => {
        const e = new Editor();
        const nitm = new BaklavaInterfaceTypes(e);
        const nt1 = new NodeInterfaceType<string>("myType");
        const nt2 = new NodeInterfaceType<number>("type2");
        nt1.addConversion(nt2, (v) => Number(v));
        nitm.addTypes(nt1, nt2);
        expect(nitm.canConvert("myType", "type2")).toEqual(true);
        expect(nitm.canConvert("type2", "myType")).toEqual(false);
        expect(nitm.canConvert("myType", "unknown")).toEqual(false);
    });

    it("correctly converts from one type to another", () => {
        const e = new Editor();
        const nitm = new BaklavaInterfaceTypes(e);
        const nt1 = new NodeInterfaceType<string>("myType");
        const nt2 = new NodeInterfaceType<string>("type2");
        nt1.addConversion(nt2, (v) => v + "abc");
        nitm.addTypes(nt1, nt2);
        expect(nitm.convert("myType", "type2", "hi")).toEqual("hiabc");
    });

    it("returns the input when converting from one type to the same type", () => {
        const e = new Editor();
        const nitm = new BaklavaInterfaceTypes(e);
        const nt1 = new NodeInterfaceType<object>("myType");
        nitm.addTypes(nt1);
        const input = {};
        expect(nitm.convert("myType", "myType", input)).toStrictEqual(input);
    });

    it.todo("automatically converts when using the engine plugin");

    it.todo("sets the correct attribute when rendering node interfaces");
});

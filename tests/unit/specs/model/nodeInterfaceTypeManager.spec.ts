import { expect } from "chai";
import { InterfaceTypePlugin } from "@/interface-types";

describe("Node Interface Type Manager", () => {

    it("can add a type", () => {
        const nitm = new InterfaceTypePlugin();
        nitm.addType("myType", "color");
    });

    it("can add a conversion", () => {
        const nitm = new InterfaceTypePlugin();
        nitm.addType("myType", "color")
            .addConversion("myType", "targetType", String);
    });

    it("can't add a conversion for a nonexisting type", () => {
        const nitm = new InterfaceTypePlugin();
        expect(() => nitm.addConversion("myType", "targetType", String)).to.throw();
    });

    it("can get a conversion", () => {
        const nitm = new InterfaceTypePlugin();
        nitm.addType("myType", "color")
            .addConversion("myType", "targetType", String);
        expect(nitm.getConversion("myType", "targetType")).to.not.be.undefined;
    });

    it("correctly checks whether a type can be converted to another type", () => {
        const nitm = new InterfaceTypePlugin();
        nitm.addType("myType", "color")
            .addConversion("myType", "targetType", String);
        expect(nitm.canConvert("myType", "targetType")).to.be.true;
        expect(nitm.canConvert("myType", "unknown")).to.be.false;
    });

    it("correctly converts from one type to another", () => {
        const nitm = new InterfaceTypePlugin();
        nitm.addType("myType", "color")
            .addConversion("myType", "targetType", (v: string) => v + "abc");
        expect(nitm.convert("myType", "targetType", "hi")).to.equal("hiabc");
    });

});

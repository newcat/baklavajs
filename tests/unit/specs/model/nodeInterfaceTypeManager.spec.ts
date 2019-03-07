import { expect } from "chai";
import { NodeInterfaceTypeManager } from "@/index";

describe("Node Interface Type Manager", () => {

    it("can add a type", () => {
        const nitm = new NodeInterfaceTypeManager();
        nitm.addType("myType", "color");
        expect(nitm.types).to.haveOwnProperty("myType");
        expect(nitm.types.myType.color).to.equal("color");
    });

    it("can add a conversion", () => {
        const nitm = new NodeInterfaceTypeManager();
        nitm.addType("myType", "color")
            .addConversion("myType", "targetType", String);
        expect(nitm.types.myType.conversions).to.have.length(1);
    });

    it("can't add a conversion for a nonexisting type", () => {
        const nitm = new NodeInterfaceTypeManager();
        expect(() => nitm.addConversion("myType", "targetType", String)).to.throw();
    });

    it("can get a conversion", () => {
        const nitm = new NodeInterfaceTypeManager();
        nitm.addType("myType", "color")
            .addConversion("myType", "targetType", String);
        expect(nitm.getConversion("myType", "targetType")).to.not.be.undefined;
    });

    it("correctly checks whether a type can be converted to another type", () => {
        const nitm = new NodeInterfaceTypeManager();
        nitm.addType("myType", "color")
            .addConversion("myType", "targetType", String);
        expect(nitm.canConvert("myType", "targetType")).to.be.true;
        expect(nitm.canConvert("myType", "unknown")).to.be.false;
    });

    it("correctly converts from one type to another", () => {
        const nitm = new NodeInterfaceTypeManager();
        nitm.addType("myType", "color")
            .addConversion("myType", "targetType", (v: string) => v + "abc");
        expect(nitm.convert("myType", "targetType", "hi")).to.equal("hiabc");
    });

});
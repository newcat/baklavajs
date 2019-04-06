import { expect } from "chai";
import { Node } from "../src";

class CustomNode extends Node {

    type = "CustomNode";
    name = this.type;

    constructor() {
        super();
        this.addInputInterface("InputOption", "InputOption");
        this.addInputInterface("InputValue", "InputOption", "defaultValue");
        this.addOutputInterface("Output");
        this.addOption("MyOption", "InputOption");
        this.addOption("MyOptionValue", "InputOption", "defaultValue");
        this.addOption("SidebarOption", "ButtonOption", "defaultValue", "InputOption");
    }

    rmi() {
        this.removeInterface("InputValue");
    }

    rmo() {
        this.removeOption("MyOption");
    }

}

describe("Node", () => {

    it("generates an id", () => {
        const n = new CustomNode();
        expect(n.id).to.satisfy((s: string) => s.startsWith("node_"));
    });

    it("allows getting all input interfaces", () => {
        const n = new CustomNode();
        const iif = n.inputInterfaces;
        expect(Object.keys(iif)).to.have.lengthOf(2);
    });

    it("allows getting all output interfaces", () => {
        const n = new CustomNode();
        const oif = n.outputInterfaces;
        expect(Object.keys(oif)).to.have.lengthOf(1);
    });

    it("correctly loads a state"); // TODO

    it("correctly saves a state"); // TODO

    it("can add an input interface with an option", () => {
        const n = new CustomNode();
        const ni = n.getInterface("InputOption");
        expect(ni.option).to.equal("InputOption");
    });

    it("can add an input interface with a default value", () => {
        const n = new CustomNode();
        const ni = n.getInterface("InputValue");
        expect(ni.value).to.equal("defaultValue");
    });

    it("can remove an interface", () => {
        const n = new CustomNode();
        expect(() => n.getInterface("InputValue")).to.not.throw();
        n.rmi();
        expect(() => n.getInterface("InputValue")).to.throw();
    });

    it("can add an option", () => {
        const n = new CustomNode();
        expect(n.options.has("MyOption")).to.be.true;
    });

    it("can add an option with a default value", () => {
        const n = new CustomNode();
        expect(n.getOptionValue("MyOptionValue")).to.equal("defaultValue");
    });

    it("can add an option with a sidebar component", () => {
        const n = new CustomNode();
        expect(n.options.get("SidebarOption")!.sidebarComponent).to.equal("InputOption");
    });

    it("can remove an option", () => {
        const n = new CustomNode();
        expect(n.options.has("MyOption")).to.be.true;
        n.rmo();
        expect(n.options.has("MyOption")).to.be.false;
    });

    it("can set an option value by its name", () => {
        const n = new CustomNode();
        n.setOptionValue("MyOption", "Hello");
        expect(n.getOptionValue("MyOption")).to.equal("Hello");
    });

});

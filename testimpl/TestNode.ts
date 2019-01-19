import { Node, Options } from "../src";

export default class TestNode extends Node {

    public type = "TestNode";
    public name = this.type;

    constructor() {
        super();
        this.addInputInterface("Input", "boolean", Options.InputOption);
        this.addOutputInterface("Output", "boolean");
        this.addOption("test", Options.InputOption);
        this.addOption("Select", Options.SelectOption, { selected: "Test1", items: ["Test1", "Test2", "Test3"] });
        this.addOption("This is a checkbox", Options.CheckboxOption, true);
        this.addOption("Number", Options.NumberOption);
    }

    public calculate() {
        this.getInterface("Output").value = this.getInterface("Input");
    }

}

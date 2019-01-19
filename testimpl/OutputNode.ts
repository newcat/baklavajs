import { Node, Options } from "../src";

export default class OutputNode extends Node {

    public type = "OutputNode";
    public name = this.type;

    public constructor() {
        super();
        this.addInputInterface("Input", "string", Options.InputOption);
        this.addOption("output", Options.TextOption);
    }

    public calculate() {
        this.setOptionValue("output", this.getInterface("Input").value);
    }

}

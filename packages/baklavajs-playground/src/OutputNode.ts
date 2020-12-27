import { Node } from "@baklavajs/core/src";

export default class OutputNode extends Node {
    public type = "OutputNode";
    public name = this.type;

    public constructor() {
        super();
        this.addInputInterface("Input", "InputOption");
        this.addInputInterface("BooleanInput", "CheckboxOption");
        this.addOption("output", "TextOption");
        this.addOption("data", "TextOption");
    }

    public calculate(data: any) {
        this.setOptionValue("output", this.getInterface("Input").value);
        this.setOptionValue("data", data);
        return { test: true };
    }
}

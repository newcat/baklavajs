import { Node } from "../../baklavajs-core/src";

export default class OutputNode extends Node {

    public type = "OutputNode";
    public name = this.type;

    public constructor() {
        super();
        this.addInputInterface("Input", "InputOption");
        this.addInputInterface("BooleanInput", "CheckboxOption");
        this.addOption("output", "TextOption");
    }

    public calculate() {
        this.setOptionValue("output", this.getInterface("Input").value);
    }

}

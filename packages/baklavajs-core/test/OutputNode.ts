import { Node, NodeInterface } from "../src";
import { IODefinition } from "../types";

export default class OutputNode<I, O> extends Node<I, O> {

    public type = "OutputNode";
    public title = this.type;

    public inputs: I = {
        test: new NodeInterface<number>(this, true, 3)
    }

    public outputs: O = {

    }

    public constructor() {
        super();
        this.addInputInterface("Input", "InputOption");
        this.addInputInterface("BooleanInput", "CheckboxOption");
    }

    public calculate() {
        this.setOptionValue("output", this.getInterface("Input").value);
    }

}

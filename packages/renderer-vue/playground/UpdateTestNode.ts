import { Node } from "@baklavajs/core";
import { ButtonInterface, CheckboxInterface, SliderInterface } from "../src";

interface Inputs {
    a: number;
    b: boolean;
    update: undefined;
}

export default class UpdateTestNode extends Node<Inputs, Record<string, never>> {
    type = "UpdateTestNode";
    inputs = {
        a: new SliderInterface("Slider", 0.5, 0, 1),
        b: new CheckboxInterface("Checkbox", false),
        update: new ButtonInterface("Update", () => this.updateValues()),
    };
    outputs = {};

    constructor() {
        super();
        this.initializeIo();
        this.title = "UpdateTestNode";
    }

    override onPlaced() {
        this.updateValues = () => {
            this.inputs.a.value = Math.random();
            this.inputs.b.value = !this.inputs.b.value;
        };
    }

    updateValues() {
        throw new Error("This should not happen");
    }
}

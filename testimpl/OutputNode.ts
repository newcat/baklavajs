import { Node } from "../src/model";
import TextOption from "../src/options/TextOption.vue";
import InputOption from "../src/options/InputOption.vue";

export default class OutputNode extends Node {

    public type = "OutputNode";
    public name = this.type;

    public constructor() {
        super();
        this.addInputInterface("Input", "string", InputOption);
    }

    public calculate() {
        console.log(this.getInterface("Input").value);
        this.setOptionValue("output", this.getInterface("Input").value);
    }

    protected getOptions() {
        return {
            output: TextOption
        };
    }

}

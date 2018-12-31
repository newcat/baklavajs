import { Node, NodeInterface } from "../model";
import TextOption from "../options/TextOption.vue";

export default class OutputNode extends Node {

    public type = "OutputNode";
    public name = this.type;

    public calculate() {
        this.options.output = this.interfaces.InputIF.value;
    }

    protected getInterfaces(): Record<string, NodeInterface> {
        return {
            InputIF: new NodeInterface(this, true, "boolean")
        };
    }

    protected getOptions() {
        return {
            output: TextOption
        };
    }

}

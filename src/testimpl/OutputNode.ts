import Node from "@/model/node";
import NodeInterface from "@/model/nodeInterface";
import TextOption from "@/options/TextOption.vue";

export default class OutputNode extends Node {

    public type = "OutputNode";
    public name = this.type;

    public calculate() {
        this.options.output = this.interfaces.InputIF.value;
    }

    protected getInterfaces(): StringRecord<NodeInterface> {
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

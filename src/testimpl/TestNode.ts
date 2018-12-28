import Node from "@/model/node";
import NodeInterface from "@/model/nodeInterface";
import InputOption from "@/options/InputOption.vue";

export default class TestNode extends Node {

    public type = "TestNode";
    public name = this.type;

    public calculate() {
        this.interfaces.OutputIF.value = this.interfaces.InputIF.value;
    }

    public getInterfaces(): StringRecord<NodeInterface> {
        return {
            InputIF: new NodeInterface(this, true, "boolean", InputOption),
            OutputIF: new NodeInterface(this, false, "boolean")
        };
    }

    public getOptions() {
        return {
            test: InputOption
        };
    }

}

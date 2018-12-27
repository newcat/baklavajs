import Node from "@/model/node";
import NodeInterface from "@/model/nodeInterface";
import TestOption from "./TestOption.vue";

export default class TestNode extends Node {

    public type = "TestNode";
    public name = this.type;

    public calculate() {
        const optValue = this.options.test;
        this.interfaces.OutputIF.value = optValue;
    }

    public getInterfaces(): StringRecord<NodeInterface> {
        return {
            InputIF: new NodeInterface(this, true, "boolean"),
            OutputIF: new NodeInterface(this, false, "boolean")
        };
    }

    public getOptions() {
        return {
            test: TestOption
        };
    }

}

import Node from "@/model/node";
import NodeInterface from "@/model/nodeInterface";
import TestOption from "./TestOption.vue";

export default class TestNode extends Node {

    public type = "TestNode";
    public name = this.type;

    public getInterfaces(): NodeInterface[] {
        return [
            new NodeInterface(this, true, "boolean", "InputIF"),
            new NodeInterface(this, false, "boolean", "OutputIF")
        ];
    }

    public getOptions() {
        return {
            test: TestOption
        };
    }

}

import Node from "@/model/node";
import NodeInterface from "@/model/nodeInterface";

export default class TestNode extends Node {

    public type = "TestNode";
    public name = this.type;

    public getInterfaces(): NodeInterface[] {
        return [
            new NodeInterface(this, true, "boolean", "InputIF"),
            new NodeInterface(this, false, "boolean", "OutputIF")
        ];
    }

}

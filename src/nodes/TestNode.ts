import Node from "@/model/node";
import NodeInterface from "@/model/nodeInterface";

export default class TestNode extends Node {

    public static type = "TestNode";

    public constructor() {
        super(TestNode.type);
    }

    public getInterfaces(): NodeInterface[] {
        return [
            new NodeInterface(this, true, "boolean", "InputIF"),
            new NodeInterface(this, false, "boolean", "OutputIF")
        ];
    }

}

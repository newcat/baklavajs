import Node from "@/model/node";
import NodeInterface from "@/model/nodeInterface";

export default class OutputNode extends Node {

    public type = "OutputNode";
    public name = this.type;

    public getInterfaces(): NodeInterface[] {
        return [
            new NodeInterface(this, true, "boolean", "InputIF")
        ];
    }

    public getOptions() {
        return {};
    }

}

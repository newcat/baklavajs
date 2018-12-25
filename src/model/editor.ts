import Node from "./node";
import Connection from "./connection";

export default class Editor {

    public nodes: Node[] = [];
    public connections: Connection[] = [];

    public nodeTypes: Record<string, Node> = {};

    /* Node Types */
    public registerNodeType(typeName: string, type: Node) {
        this.nodeTypes[typeName] = type;
    }

    public addNode(typeNameOrInstance: string|Node) {
        let n = typeNameOrInstance;
        if (typeof(n) === "string") {
            if (this.nodeTypes[n]) {
                n = new (this.nodeTypes[n] as any)();
                this.addNode(n);
            }
        } else {
            this.nodes.push(n);
        }
    }

}

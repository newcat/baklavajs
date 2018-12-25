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

    /* Nodes */
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

    public removeNode(n: Node) {
        if (this.nodes.includes(n)) {
            this.nodes.splice(this.nodes.indexOf(n), 1);
        }
    }

    /* Connections */
    public addConnection(c: Connection) {
        this.connections.push(c);
    }

    public removeConnection(c: Connection) {
        if (this.connections.includes(c)) {
            this.connections.splice(this.connections.indexOf(c), 1);
        }
    }

}

import Node from "./node";
import Connection from "./connection";
import NodeTreeBuilder from "@/utility/nodeTreeBuilder";

export default class Editor {

    public nodes: Node[] = [];
    public connections: Connection[] = [];
    public nodeTypes: Record<string, Node> = {};

    private _nodeCalculationOrder: Node[] = [];
    public get nodeCalculationOrder() {
        return this._nodeCalculationOrder;
    }

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
            this.connections
                .filter((c) => c.from.node === n || c.to.node === n)
                .forEach((c) => this.removeConnection(c));
            this.nodes.splice(this.nodes.indexOf(n), 1);
        }
    }

    /* Connections */
    public addConnection(c: Connection) {

        // check whether this connection is possible or
        // would result in a cycle in the graph
        try {
            /*const copy = this.connections.slice();
            copy.push(c);*/
            this.connections.push(c);
            this.calculateNodeTree();
        } catch {
            // tslint:disable-next-line:no-console
            console.warn("Detected cycle");
        }

    }

    public removeConnection(c: Connection) {
        if (this.connections.includes(c)) {
            this.connections.splice(this.connections.indexOf(c), 1);
            this.calculateNodeTree();
        }
    }

    /* Calculate */
    public async calculate() {
        for (const n of this._nodeCalculationOrder) {
            await n.calculate();
        }
    }

    private calculateNodeTree() {
        const ntb = new NodeTreeBuilder();
        this._nodeCalculationOrder = ntb.calculateTree(this.nodes, this.connections);
    }

}

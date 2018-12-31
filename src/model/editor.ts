import { Node } from "./node";
import { INodeInterfacePair, IConnection, Connection } from "./connection";
import NodeTreeBuilder from "../utility/nodeTreeBuilder";
import { DummyConnection } from "./dummyConnection";

type TypeComparer = (c: IConnection) => boolean;

export class Editor {

    public nodes: Node[] = [];
    public connections: Connection[] = [];
    public nodeTypes: Record<string, Node> = {};

    private _nodeCalculationOrder: Node[] = [];
    public get nodeCalculationOrder() {
        return this._nodeCalculationOrder;
    }

    private _typeComparer: TypeComparer = (c) => c.from.interface.type === c.to.interface.type;
    public set typeComparer(value: TypeComparer) {
        this._typeComparer = value;
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
    public addConnection(from: INodeInterfacePair, to: INodeInterfacePair) {

        if (!this.checkConnection(from, to)) {
            return false;
        }

        // Delete all other connections to the target interface
        // as only one connection to an input interface is allowed
        this.connections
            .filter((conn) => conn.to.interface === to.interface)
            .forEach((conn) => this.removeConnection(conn, false));

        const c = new Connection(from, to);
        this.connections.push(c);
        this.calculateNodeTree();
        return true;

    }

    public removeConnection(c: Connection, calculateNodeTree = true) {
        if (this.connections.includes(c)) {
            c.destruct();
            this.connections.splice(this.connections.indexOf(c), 1);
            if (calculateNodeTree) {
                this.calculateNodeTree();
            }
        }
    }

    public checkConnection(from: INodeInterfacePair, to: INodeInterfacePair): boolean {

        if (from.interface.isInput || !to.interface.isInput) {
            // connections are only allowed from input to output interface
            return false;
        } else if (from.node === to.node) {
            // connections must be between two separate nodes.
            return false;
        }

        // check if the new connection would result in a cycle
        const ntb = new NodeTreeBuilder();
        const dc = new DummyConnection(from, to);
        const copy = (this.connections as IConnection[]).concat([dc]);
        copy.filter((conn) => conn.to.interface !== to.interface);
        try {
            ntb.calculateTree(this.nodes, copy);
        } catch (err) {
            // this connection would create a cycle in the graph
            return false;
        }

        // check type compatibility between the two interfaces
        return this._typeComparer(dc);

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

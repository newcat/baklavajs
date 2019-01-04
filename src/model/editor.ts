import { Node } from "./node";
import { INodeInterfacePair, IConnection, Connection } from "./connection";
import NodeTreeBuilder from "../utility/nodeTreeBuilder";
import { DummyConnection } from "./connection";
import { IState } from "./state";

type TypeComparer = (c: IConnection) => boolean;
type NodeConstructor = new () => Node;

export class Editor {

    public nodes: Node[] = [];
    public connections: Connection[] = [];
    public nodeTypes: Record<string, NodeConstructor> = {};

    private _nodeCalculationOrder: Node[] = [];
    /**
     * The order, in which the nodes must be calculated
     */
    public get nodeCalculationOrder() {
        return this._nodeCalculationOrder;
    }

    private _typeComparer: TypeComparer = (c) => c.from.interface.type === c.to.interface.type;
    /**
     * Use this to override the default type comparer.
     * The function will be called with a connection.
     * You can check whether this connection is allowed using
     * the fields `from` and `to` of the connection.
     * Default type comparer:
     * `(c) => c.from.interface.type === c.to.interface.type;`
     */
    public set typeComparer(value: TypeComparer) {
        this._typeComparer = value;
    }

    /* Node Types */
    public registerNodeType(typeName: string, type: NodeConstructor) {
        this.nodeTypes[typeName] = type;
    }

    /* Nodes */
    public addNode(typeNameOrInstance: string|Node) {
        let n = typeNameOrInstance;
        if (typeof(n) === "string") {
            if (this.nodeTypes[n]) {
                n = new (this.nodeTypes[n])();
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
    /**
     * Add a connection to the list of connections.
     * @param from Start interface for the connection
     * @param to Target interface for the connection
     * @param calculateNodeTree Whether to update the node calculation order after adding the connection
     * @returns Whether the connection was successfully created
     */
    public addConnection(from: INodeInterfacePair, to: INodeInterfacePair, calculateNodeTree = true) {

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
        if (calculateNodeTree) { this.calculateNodeTree(); }
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

    /* Loading / Saving */
    public load(state: IState) {

        // Clear current state
        for (let i = this.connections.length - 1; i >= 0; i--) {
            this.removeConnection(this.connections[i], false);
        }
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            this.removeNode(this.nodes[i]);
        }

        // Load state
        for (const n of state.nodes) {

            // find node type
            const nt = this.nodeTypes[n.type];
            if (!nt) {
                // tslint:disable-next-line:no-console
                console.warn(`Node type ${n.type} is not registered`);
                continue;
            }

            const node = new nt();
            node.load(n);
            this.addNode(node);

        }

        for (const c of state.connections) {
            const fromIf = this.findNodeInterface(c.from);
            const toIf = this.findNodeInterface(c.to);
            if (!fromIf) {
                // tslint:disable-next-line:no-console
                console.warn(`Could not find interface with id ${c.from}`);
                continue;
            } else if (!toIf) {
                // tslint:disable-next-line:no-console
                console.warn(`Could not find interface with id ${c.to}`);
                continue;
            } else {
                this.addConnection(
                    { interface: fromIf, node: fromIf.parent },
                    { interface: toIf, node: toIf.parent },
                    false
                );
            }
        }

        this.calculateNodeTree();

    }

    private findNodeInterface(id: string) {
        for (const n of this.nodes) {
            for (const ik of Object.keys(n.interfaces)) {
                if (n.interfaces[ik].id === id) {
                    return n.interfaces[ik];
                }
            }
        }
    }

    public save(): IState {
        return {
            nodes: this.nodes.map((n) => n.save()),
            connections: this.connections.map((c) => ({
                id: c.id,
                from: c.from.interface.id,
                to: c.to.interface.id
            }))
        };
    }

}

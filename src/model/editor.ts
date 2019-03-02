import Vue from "vue";
import { Node } from "./node";
import { NodeInterface } from "./nodeInterface";
import { IConnection, Connection } from "./connection";
import NodeTreeBuilder from "../utility/nodeTreeBuilder";
import { DummyConnection } from "./connection";
import { IState } from "./state";
import { NodeInterfaceTypeManager } from "./nodeInterfaceTypeManager";

export type NodeConstructor = new () => Node;

/** The main model class for BaklavaJS */
export class Editor {

    private _nodes: Node[] = [];
    private _connections: Connection[] = [];
    private _nodeTypes: Record<string, NodeConstructor> = {};
    private _nodeCategories: Record<string, string[]> = { default: [] };
    private _nodeCalculationOrder: Node[] = [];

    /** The order, in which the nodes must be calculated */
    public get nodeCalculationOrder() {
        return this._nodeCalculationOrder;
    }

    /** List of all nodes */
    public get nodes() {
        return this._nodes as ReadonlyArray<Node>;
    }

    /** List of all connections */
    public get connections() {
        return this._connections as ReadonlyArray<Connection>;
    }

    /** List of all registered node types */
    public get nodeTypes() {
        return this._nodeTypes as Readonly<Record<string, NodeConstructor>>;
    }

    /** Mapping of nodes to node categories */
    public get nodeCategories() {
        return this._nodeCategories as Readonly<Record<string, string[]>>;
    }

    /** Used to manage all node interface types and implementing conversions between them */
    public nodeInterfaceTypes = new NodeInterfaceTypeManager();

    /**
     * Register a new node type
     * @param typeName Name of the node (must be equal to the node's `type` field)
     * @param type Actual type / constructor of the node
     * @param category Category of the node. Will be used in the context menu for adding nodes
     */
    public registerNodeType(typeName: string, type: NodeConstructor, category = "default") {
        Vue.set(this.nodeTypes, typeName, type);
        if (!this.nodeCategories[category]) {
            Vue.set(this.nodeCategories, category, []);
        }
        this.nodeCategories[category].push(typeName);
    }

    /**
     * Add a node to the list of nodes.
     * @param typeNameOrInstance Either a registered node type or a node instance
     * @returns Instance of the node
     */
    public addNode(typeNameOrInstance: string|Node): Node|undefined {
        let n = typeNameOrInstance;
        if (typeof(n) === "string") {
            if (this.nodeTypes[n]) {
                n = new (this.nodeTypes[n])();
                return this.addNode(n);
            } else {
                return undefined;
            }
        } else if (typeof(n) === "object") {
            n.registerEditor(this);
            this._nodes.push(n);
            return n;
        } else {
            throw new TypeError("Expected Object, got " + typeof(n));
        }
    }

    /**
     * Removes a node from the list.
     * Will also remove all connections from and to the node.
     * @param n Reference to a node in the list.
     */
    public removeNode(n: Node) {
        if (this.nodes.includes(n)) {
            this.connections
                .filter((c) => c.from.parent === n || c.to.parent === n)
                .forEach((c) => this.removeConnection(c));
            this._nodes.splice(this.nodes.indexOf(n), 1);
        }
    }

    /**
     * Add a connection to the list of connections.
     * @param from Start interface for the connection
     * @param to Target interface for the connection
     * @param calculateNodeTree Whether to update the node calculation order after adding the connection
     * @returns Whether the connection was successfully created
     */
    public addConnection(from: NodeInterface, to: NodeInterface, calculateNodeTree = true): boolean {

        const dc = this.checkConnection(from, to);
        if (!dc) {
            return false;
        }

        // Delete all other connections to the target interface
        // as only one connection to an input interface is allowed
        this.connections
            .filter((conn) => conn.to === dc.to)
            .forEach((conn) => this.removeConnection(conn, false));

        const c = new Connection(dc.from, dc.to, this.nodeInterfaceTypes);
        this._connections.push(c);
        if (calculateNodeTree) { this.calculateNodeTree(); }
        return true;

    }

    /**
     * Remove a connection from the list of connections.
     * @param c Connection instance that should be removed.
     * @param calculateNodeTree Whether to update the node calculation order.
     * Set to false if you do multiple remove operations and call {@link calculateNodeTree} manually
     * after the last remove operation.
     */
    public removeConnection(c: Connection, calculateNodeTree = true) {
        if (this.connections.includes(c)) {
            c.destruct();
            this._connections.splice(this.connections.indexOf(c), 1);
            if (calculateNodeTree) {
                this.calculateNodeTree();
            }
        }
    }

    /**
     * Checks, whether a connection between two node interfaces would be valid.
     * @param from The starting node interface (must be an output interface)
     * @param to The target node interface (must be an input interface)
     * @returns Whether the connection is allowed or not.
     */
    public checkConnection(from: NodeInterface, to: NodeInterface): false|IConnection {

        if (!from || !to) {
            return false;
        } else if (from.parent === to.parent) {
            // connections must be between two separate nodes.
            return false;
        }

        if (from.isInput && !to.isInput) {
            // reverse connection
            const tmp = from;
            from = to;
            to = tmp;
        }

        if (from.isInput || !to.isInput) {
            // connections are only allowed from input to output interface
            return false;
        }

        // check if the new connection would result in a cycle
        const ntb = new NodeTreeBuilder();
        const dc = new DummyConnection(from, to);
        const copy = (this._connections as IConnection[]).concat([dc]);
        copy.filter((conn) => conn.to !== to);
        try {
            ntb.calculateTree(this._nodes, copy);
        } catch (err) {
            // this connection would create a cycle in the graph
            return false;
        }

        // check type compatibility between the two interfaces
        if (this.nodeInterfaceTypes.canConvert(dc.from.type, dc.to.type)) {
            return dc;
        } else {
            return false;
        }

    }

    /** Calculate all nodes */
    public async calculate() {
        for (const n of this._nodeCalculationOrder) {
            await n.calculate();
        }
    }

    /** Recalculate the node calculation order */
    public calculateNodeTree() {
        const ntb = new NodeTreeBuilder();
        this._nodeCalculationOrder = ntb.calculateTree(this._nodes, this._connections);
    }

    /**
     * Load a state
     * @param state State to load
     */
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
                this.addConnection(fromIf, toIf, false);
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

    /**
     * Save a state
     * @returns Current state
     */
    public save(): IState {
        return {
            nodes: this.nodes.map((n) => n.save()),
            connections: this.connections.map((c) => ({
                id: c.id,
                from: c.from.id,
                to: c.to.id
            }))
        };
    }

}

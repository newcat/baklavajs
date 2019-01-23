import Vue from "vue";
import { Node } from "./node";
import { NodeInterface } from "./nodeInterface";
import { IConnection, Connection } from "./connection";
import NodeTreeBuilder from "../utility/nodeTreeBuilder";
import { DummyConnection } from "./connection";
import { IState } from "./state";

type TypeComparer = (c: IConnection) => boolean;
export type NodeConstructor = new () => Node;

/** The main model class for BaklavaJS */
export class Editor {

    /** List of all nodes */
    public nodes: Node[] = [];
    /** List of all connections */
    public connections: Connection[] = [];
    /** List of all registered node types */
    public nodeTypes: Record<string, NodeConstructor> = {};
    /** Mapping of nodes to node categories */
    public nodeCategories: Record<string, string[]> = { default: [] };

    private _nodeCalculationOrder: Node[] = [];
    /**
     * The order, in which the nodes must be calculated
     */
    public get nodeCalculationOrder() {
        return this._nodeCalculationOrder;
    }

    private _typeComparer: TypeComparer = (c) => c.from.type === c.to.type;
    /**
     * Use this to override the default type comparer.
     * The function will be called with a connection.
     * You can check whether this connection is allowed using
     * the fields `from` and `to` of the connection.
     *
     * @default (c) => c.from.type === c.to.type;
     */
    public set typeComparer(value: TypeComparer) {
        this._typeComparer = value;
    }

    /**
     * Register a new node type
     * @param {string} typeName Name of the node (must be equal to the node's `type` field)
     * @param {NodeConstructor} type Actual type / constructor of the node
     * @param {string} [category="default"] Category of the node. Will be used in the context menu for adding nodes
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
     * @param {string|Node} typeNameOrInstance Either a registered node type or a node instance
     * @returns {Node} Instance of the node
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
            this.nodes.push(n);
            return n;
        } else {
            throw new TypeError("Expected Object, got " + typeof(n));
        }
    }

    /**
     * Removes a node from the list.
     * Will also remove all connections from and to the node.
     * @param {Node} n Reference to a node in the list.
     */
    public removeNode(n: Node) {
        if (this.nodes.includes(n)) {
            this.connections
                .filter((c) => c.from.parent === n || c.to.parent === n)
                .forEach((c) => this.removeConnection(c));
            this.nodes.splice(this.nodes.indexOf(n), 1);
        }
    }

    /**
     * Add a connection to the list of connections.
     * @param {NodeInterface} from Start interface for the connection
     * @param {NodeInterface} to Target interface for the connection
     * @param {boolean} [calculateNodeTree=true]
     * Whether to update the node calculation order after adding the connection
     * @returns {boolean} Whether the connection was successfully created
     */
    public addConnection(from: NodeInterface, to: NodeInterface, calculateNodeTree = true): boolean {

        if (!this.checkConnection(from, to)) {
            return false;
        }

        // Delete all other connections to the target interface
        // as only one connection to an input interface is allowed
        this.connections
            .filter((conn) => conn.to === to)
            .forEach((conn) => this.removeConnection(conn, false));

        const c = new Connection(from, to);
        this.connections.push(c);
        if (calculateNodeTree) { this.calculateNodeTree(); }
        return true;

    }

    /**
     * Remove a connection from the list of connections.
     * @param {Connection} c Connection instance that should be removed.
     * @param {boolean} [calculateNodeTree=true] Whether to update the node calculation order.
     * Set to false if you do multiple remove operations and call {@link calculateNodeTree} manually
     * after the last remove operation.
     */
    public removeConnection(c: Connection, calculateNodeTree = true) {
        if (this.connections.includes(c)) {
            c.destruct();
            this.connections.splice(this.connections.indexOf(c), 1);
            if (calculateNodeTree) {
                this.calculateNodeTree();
            }
        }
    }

    /**
     * Checks, whether a connection between two node interfaces would be valid.
     * @param {NodeInterface} from The starting node interface (must be an output interface)
     * @param {NodeInterface} to The target node interface (must be an input interface)
     * @returns {boolean} Whether the connection is allowed or not.
     */
    public checkConnection(from: NodeInterface, to: NodeInterface): boolean {

        if (from.isInput || !to.isInput) {
            // connections are only allowed from input to output interface
            return false;
        } else if (from.parent === to.parent) {
            // connections must be between two separate nodes.
            return false;
        }

        // check if the new connection would result in a cycle
        const ntb = new NodeTreeBuilder();
        const dc = new DummyConnection(from, to);
        const copy = (this.connections as IConnection[]).concat([dc]);
        copy.filter((conn) => conn.to !== to);
        try {
            ntb.calculateTree(this.nodes, copy);
        } catch (err) {
            // this connection would create a cycle in the graph
            return false;
        }

        // check type compatibility between the two interfaces
        return this._typeComparer(dc);

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
        this._nodeCalculationOrder = ntb.calculateTree(this.nodes, this.connections);
    }

    /**
     * Load a state
     * @param {IState} state State to load
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
     * @returns {IState} Current state
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

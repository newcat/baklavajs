import Vue from "vue";
import { Node } from "./node";
import { NodeInterface } from "./nodeInterface";
import { Connection } from "./connection";
import { IState } from "./state";
import { NodeInterfaceTypeManager } from "./nodeInterfaceTypeManager";
import { containsCycle } from "../engine/nodeTreeBuilder";
import * as Events from "../events";
import { SyncWaterfallHook } from "tapable";

export type NodeConstructor = new () => Node;

/** The main model class for BaklavaJS */
export class Editor extends Events.BaklavaEventEmitter {

    public readonly hooks = {
        addNode: new SyncWaterfallHook([ "node", "prevent" ]),
        removeNode: new SyncWaterfallHook([ "node", "prevent" ])
    };

    private _nodes: Node[] = [];
    private _connections: Connection[] = [];
    private _nodeTypes: Map<string, NodeConstructor> = new Map();
    private _nodeCategories: Map<string, string[]> = new Map([["default", []]]);

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
        return this._nodeTypes as ReadonlyMap<string, NodeConstructor>;
    }

    /** Mapping of nodes to node categories */
    public get nodeCategories() {
        return this._nodeCategories as ReadonlyMap<string, string[]>;
    }

    /** Used to manage all node interface types and implementing conversions between them */
    public nodeInterfaceTypes = new NodeInterfaceTypeManager();

    public panning = { x: 0, y: 0 };
    public scaling = 1;

    /**
     * Register a new node type
     * @param typeName Name of the node (must be equal to the node's `type` field)
     * @param type Actual type / constructor of the node
     * @param category Category of the node. Will be used in the context menu for adding nodes
     */
    public registerNodeType(typeName: string, type: NodeConstructor, category = "default") {
        this._nodeTypes.set(typeName, type);
        if (!this.nodeCategories.has(category)) {
            Vue.set(this.nodeCategories, category, []);
        }
        this.nodeCategories.get(category)!.push(typeName);
    }

    /**
     * Add a node to the list of nodes.
     * @param node Instance of a node
     * @returns Instance of the node or undefined if the node was not added
     */
    public addNode(node: Node): Node|undefined {
        const [n, prevent] = this.hooks.addNode.call(node, false);
        if (!n || prevent) { return; }
        n.registerEditor(this);
        this._nodes.push(n);
        this.emit<Events.INodeEventData>("addNode", { node: n });
        return n;
    }

    /**
     * Removes a node from the list.
     * Will also remove all connections from and to the node.
     * @param node Reference to a node in the list.
     */
    public removeNode(node: Node) {
        if (this.nodes.includes(node)) {
            const [n, prevent] = this.hooks.removeNode.call(node, false);
            if (!n || prevent) { return; }
            this.connections
                .filter((c) => c.from.parent === n || c.to.parent === n)
                .forEach((c) => this.removeConnection(c));
            this._nodes.splice(this.nodes.indexOf(n), 1);
            this.emit<Events.INodeEventData>("removeNode", { node: n });
        }
    }

    /**
     * Add a connection to the list of connections.
     * @param from Start interface for the connection
     * @param to Target interface for the connection
     * @returns The created connection. If no connection could be created, returns `undefined`.
     */
    public addConnection(from: NodeInterface, to: NodeInterface): Connection|undefined {

        const dc = this.checkConnection(from, to);
        if (!dc) {
            return undefined;
        }

        if (this.emitPreventable<Events.IAddConnectionEventData>("beforeAddConnection", { from, to })) { return; }

        // Delete all other connections to the target interface
        // as only one connection to an input interface is allowed
        this.connections
            .filter((conn) => conn.to === dc.to)
            .forEach((conn) => this.removeConnection(conn));

        const c = new Connection(dc.from, dc.to);
        this._connections.push(c);

        this.emit<Events.IConnectionEventData>("addConnection", { connection: c });

        return c;

    }

    /**
     * Remove a connection from the list of connections.
     * @param c Connection instance that should be removed.
     * @param calculateNodeTree Whether to update the node calculation order.
     * Set to false if you do multiple remove operations and call {@link calculateNodeTree} manually
     * after the last remove operation.
     */
    public removeConnection(c: Connection) {
        if (this.connections.includes(c)) {
            if (this.emitPreventable<Events.IConnectionEventData>("beforeRemoveConnection", { connection: c })) { return; }
            c.destruct();
            this._connections.splice(this.connections.indexOf(c), 1);
            this.emit<Events.IConnectionEventData>("removeConnection", { connection: c });
        }
    }

    /**
     * Checks, whether a connection between two node interfaces would be valid.
     * @param from The starting node interface (must be an output interface)
     * @param to The target node interface (must be an input interface)
     * @returns Whether the connection is allowed or not.
     */
    public checkConnection(from: NodeInterface, to: NodeInterface): false|Connection {

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
        const dc = new Connection(from, to);
        const copy = (this._connections as Connection[]).concat([dc]);
        copy.filter((conn) => conn.to !== to);
        if (containsCycle(this.nodes, copy)) {
            return false;
        }

        // check type compatibility between the two interfaces
        if (this.nodeInterfaceTypes.canConvert(dc.from.type, dc.to.type)) {
            return dc;
        } else {
            return false;
        }

    }

    /**
     * Load a state
     * @param state State to load
     */
    public load(state: IState) {

        // Clear current state
        for (let i = this.connections.length - 1; i >= 0; i--) {
            this.removeConnection(this.connections[i]);
        }
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            this.removeNode(this.nodes[i]);
        }

        // Load state
        for (const n of state.nodes) {

            // find node type
            const nt = this.nodeTypes.get(n.type);
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
                this.addConnection(fromIf, toIf);
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

    private findNodeInterface(id: string) {
        for (const n of this.nodes) {
            for (const ik of n.interfaces.keys()) {
                if (n.interfaces.get(ik)!.id === id) {
                    return n.interfaces.get(ik)!;
                }
            }
        }
    }

}

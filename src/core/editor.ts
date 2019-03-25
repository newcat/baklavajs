import Vue from "vue";
import { Node } from "./node";
import { NodeInterface } from "./nodeInterface";
import { Connection, DummyConnection } from "./connection";
import { IState } from "./state";
import { NodeInterfaceTypeManager } from "./nodeInterfaceTypeManager";
import { BaklavaEventEmitter, INodeEventData, IAddConnectionEventData, IConnectionEventData } from "./events";
import { IPlugin } from "./plugin";

export type NodeConstructor = new () => Node;

/** The main model class for BaklavaJS */
export class Editor extends BaklavaEventEmitter {

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
        if (this.emitPreventable<INodeEventData>("beforeAddNode", { node })) { return; }
        node.registerEditor(this);
        this._nodes.push(node);
        this.emit<INodeEventData>("addNode", { node });
        return node;
    }

    /**
     * Removes a node from the list.
     * Will also remove all connections from and to the node.
     * @param node Reference to a node in the list.
     */
    public removeNode(node: Node) {
        if (this.nodes.includes(node)) {
            if (this.emitPreventable<INodeEventData>("beforeRemoveNode", { node })) { return; }
            this.connections
                .filter((c) => c.from.parent === node || c.to.parent === node)
                .forEach((c) => this.removeConnection(c));
            this._nodes.splice(this.nodes.indexOf(node), 1);
            this.emit<INodeEventData>("removeNode", { node });
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

        if (this.emitPreventable<IAddConnectionEventData>("beforeAddConnection", { from, to })) { return; }

        // Delete all other connections to the target interface
        // as only one connection to an input interface is allowed
        this.connections
            .filter((conn) => conn.to === dc.to)
            .forEach((conn) => this.removeConnection(conn));

        const c = new Connection(dc.from, dc.to);
        this._connections.push(c);

        this.emit<IConnectionEventData>("addConnection", { connection: c });

        return c;

    }

    /**
     * Remove a connection from the list of connections.
     * @param connection Connection instance that should be removed.
     */
    public removeConnection(connection: Connection) {
        if (this.connections.includes(connection)) {
            if (this.emitPreventable<IConnectionEventData>("beforeRemoveConnection", { connection })) { return; }
            connection.destruct();
            this._connections.splice(this.connections.indexOf(connection), 1);
            this.emit<IConnectionEventData>("removeConnection", { connection });
        }
    }

    /**
     * Checks, whether a connection between two node interfaces would be valid.
     * @param from The starting node interface (must be an output interface)
     * @param to The target node interface (must be an input interface)
     * @returns Whether the connection is allowed or not.
     */
    public checkConnection(from: NodeInterface, to: NodeInterface): false|DummyConnection {

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

        return new DummyConnection(from, to);

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

    /**
     * Register a plugin
     */
    public use(plugin: IPlugin) {
        plugin.register(this);
    }

}

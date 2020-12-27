import { PreventableBaklavaEvent, BaklavaEvent, SequentialHook } from "@baklavajs/events";
import type { NodeInterface } from "./nodeInterface";
import { Connection, DummyConnection, IConnection, IConnectionState } from "./connection";
import { AbstractNode, INodeState, AbstractNodeConstructor } from "./node";
import { IAddConnectionEventData, IAddNodeTypeEventData } from "./eventDataTypes";

export interface IPlugin {
    type: string;
    register(editor: Editor): void;
}

export interface IState extends Record<string, any> {
    nodes: Array<INodeState<unknown, unknown>>;
    connections: IConnectionState[];
}

/** The main model class for BaklavaJS */
export class Editor {
    private _plugins: Set<IPlugin> = new Set();
    private _nodes: AbstractNode[] = [];
    private _connections: Connection[] = [];
    private _nodeTypes: Map<string, AbstractNodeConstructor> = new Map();
    private _nodeCategories: Map<string, string[]> = new Map([["default", []]]);

    public events = {
        beforeRegisterNodeType: new PreventableBaklavaEvent<IAddNodeTypeEventData>(),
        registerNodeType: new BaklavaEvent<IAddNodeTypeEventData>(),
        beforeAddNode: new PreventableBaklavaEvent<AbstractNode>(),
        addNode: new BaklavaEvent<AbstractNode>(),
        beforeRemoveNode: new PreventableBaklavaEvent<AbstractNode>(),
        removeNode: new BaklavaEvent<AbstractNode>(),
        beforeAddConnection: new PreventableBaklavaEvent<IAddConnectionEventData>(),
        addConnection: new BaklavaEvent<IConnection>(),
        checkConnection: new PreventableBaklavaEvent<IAddConnectionEventData>(),
        beforeRemoveConnection: new PreventableBaklavaEvent<IConnection>(),
        removeConnection: new BaklavaEvent<IConnection>(),
        beforeUsePlugin: new PreventableBaklavaEvent<IPlugin>(),
        usePlugin: new BaklavaEvent<IPlugin>(),
    };

    public hooks = {
        save: new SequentialHook<IState>(),
        load: new SequentialHook<IState>(),
    };

    /** List of all nodes */
    public get nodes(): ReadonlyArray<AbstractNode> {
        return this._nodes;
    }

    /** List of all connections */
    public get connections(): ReadonlyArray<Connection> {
        return this._connections;
    }

    /** List of all registered node types */
    public get nodeTypes(): ReadonlyMap<string, AbstractNodeConstructor> {
        return this._nodeTypes;
    }

    /** Mapping of nodes to node categories */
    public get nodeCategories(): ReadonlyMap<string, string[]> {
        return this._nodeCategories;
    }

    /** List of all plugins in this editor */
    public get plugins(): ReadonlySet<IPlugin> {
        return this._plugins;
    }

    /**
     * Register a new node type
     * @param typeName Name of the node (must be equal to the node's `type` field)
     * @param type Actual type / constructor of the node
     * @param category Category of the node. Will be used in the view's context menu for adding nodes
     */
    public registerNodeType(typeName: string, type: AbstractNodeConstructor, category = "default"): void {
        if (this.events.beforeRegisterNodeType.emit({ typeName, type, category })) {
            return;
        }
        this._nodeTypes.set(typeName, type);
        if (!this.nodeCategories.has(category)) {
            this._nodeCategories.set(category, []);
        }
        this.nodeCategories.get(category)!.push(typeName);
        this.events.registerNodeType.emit({ typeName, type, category });
    }

    /**
     * Add a node to the list of nodes.
     * @param node Instance of a node
     * @returns Instance of the node or undefined if the node was not added
     */
    public addNode(node: AbstractNode): AbstractNode | undefined {
        if (this.events.beforeAddNode.emit(node)) {
            return;
        }
        node.registerEditor(this);
        this._nodes.push(node);
        this.events.addNode.emit(node);
        return node;
    }

    /**
     * Removes a node from the list.
     * Will also remove all connections from and to the node.
     * @param node Reference to a node in the list.
     */
    public removeNode(node: AbstractNode): void {
        if (this.nodes.includes(node)) {
            if (this.events.beforeRemoveNode.emit(node)) {
                return;
            }
            this.connections
                .filter((c) => c.from.parent === node || c.to.parent === node)
                .forEach((c) => this.removeConnection(c));
            this._nodes.splice(this.nodes.indexOf(node), 1);
            this.events.removeNode.emit(node);
        }
    }

    /**
     * Add a connection to the list of connections.
     * @param from Start interface for the connection
     * @param to Target interface for the connection
     * @returns The created connection. If no connection could be created, returns `undefined`.
     */
    public addConnection(from: NodeInterface<unknown>, to: NodeInterface<unknown>): Connection | undefined {
        const dc = this.checkConnection(from, to);
        if (!dc) {
            return undefined;
        }

        if (this.events.beforeAddConnection.emit({ from, to })) {
            return;
        }

        const c = new Connection(dc.from, dc.to);
        this._connections.push(c);

        this.events.addConnection.emit(c);

        return c;
    }

    /**
     * Remove a connection from the list of connections.
     * @param connection Connection instance that should be removed.
     */
    public removeConnection(connection: Connection): void {
        if (this.connections.includes(connection)) {
            if (this.events.beforeRemoveConnection.emit(connection)) {
                return;
            }
            connection.destruct();
            this._connections.splice(this.connections.indexOf(connection), 1);
            this.events.removeConnection.emit(connection);
        }
    }

    /**
     * Checks, whether a connection between two node interfaces would be valid.
     * @param from The starting node interface (must be an output interface)
     * @param to The target node interface (must be an input interface)
     * @returns Whether the connection is allowed or not.
     */
    public checkConnection(from: NodeInterface<unknown>, to: NodeInterface<unknown>): false | DummyConnection {
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

        // prevent duplicate connections
        if (this.connections.some((c) => c.from === from && c.to === to)) {
            return false;
        }

        if (this.events.checkConnection.emit({ from, to })) {
            return false;
        }

        return new DummyConnection(from, to);
    }

    /**
     * Load a state
     * @param state State to load
     */
    public load(state: IState): void {
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
                console.warn(`Node type ${n.type} is not registered`);
                continue;
            }

            const node = new nt() as AbstractNode;
            this.addNode(node);
            node.load(n);
        }

        for (const c of state.connections) {
            const fromIf = this.findNodeInterface(c.from);
            const toIf = this.findNodeInterface(c.to);
            if (!fromIf) {
                console.warn(`Could not find interface with id ${c.from}`);
                continue;
            } else if (!toIf) {
                console.warn(`Could not find interface with id ${c.to}`);
                continue;
            } else {
                this.addConnection(fromIf, toIf);
            }
        }

        this.hooks.load.execute(state);
    }

    /**
     * Save a state
     * @returns Current state
     */
    public save(): IState {
        const state = {
            nodes: this.nodes.map((n) => n.save()),
            connections: this.connections.map((c) => ({
                id: c.id,
                from: c.from.id,
                to: c.to.id,
            })),
        };
        return this.hooks.save.execute(state);
    }

    /**
     * Register a plugin
     * @param plugin Plugin to register
     * @returns Whether the plugin was successfully registered
     */
    public use(plugin: IPlugin): boolean {
        if (this.events.beforeUsePlugin.emit(plugin)) {
            return false;
        }
        this._plugins.add(plugin);
        plugin.register(this);
        this.events.usePlugin.emit(plugin);
        return true;
    }

    public findNodeInterface(id: string): NodeInterface<unknown> | undefined {
        for (const node of this.nodes) {
            for (const k in node.inputs) {
                const nodeInput = node.inputs[k];
                if (nodeInput.id === id) {
                    return nodeInput as NodeInterface<unknown>;
                }
            }
            for (const k in node.outputs) {
                const nodeOutput = node.outputs[k];
                if (nodeOutput.id === id) {
                    return nodeOutput as NodeInterface<unknown>;
                }
            }
        }
    }
}

import { v4 as uuidv4 } from "uuid";
import {
    BaklavaEvent,
    createProxy,
    IBaklavaEventEmitter,
    IBaklavaTapable,
    PreventableBaklavaEvent,
    SequentialHook,
    ParallelHook,
} from "@baklavajs/events";
import { Connection, DummyConnection, IConnection, IConnectionState } from "./connection";
import type { Editor } from "./editor";
import type { GraphTemplate } from "./graphTemplate";
import type { IAddConnectionEventData } from "./eventDataTypes";
import type { AbstractNode, INodeState } from "./node";
import type { NodeInterface } from "./nodeInterface";

export interface IGraphInterface {
    id: string;
    nodeInterfaceId: string;
    name: string;
}

export interface IGraphState {
    id: string;
    nodes: Array<INodeState<unknown, unknown>>;
    connections: IConnectionState[];
    inputs: IGraphInterface[];
    outputs: IGraphInterface[];
}

export interface CheckConnectionHookResult {
    connectionAllowed: boolean;
    connectionsInDanger: IConnection[];
}

interface PositiveCheckConnectionResult extends CheckConnectionHookResult {
    connectionAllowed: true;
    dummyConnection: DummyConnection;
}

interface NegativeCheckConnectionResult {
    connectionAllowed: false;
}

export type CheckConnectionResult = PositiveCheckConnectionResult | NegativeCheckConnectionResult;

export class Graph implements IBaklavaEventEmitter, IBaklavaTapable {
    public id = uuidv4();
    public editor: Editor;
    public template?: GraphTemplate;

    public inputs: IGraphInterface[] = [];
    public outputs: IGraphInterface[] = [];

    protected _nodes: AbstractNode[] = [];
    protected _connections: Connection[] = [];
    protected _loading = false;
    protected _destroying = false;

    public events = {
        beforeAddNode: new PreventableBaklavaEvent<AbstractNode, Graph>(this),
        addNode: new BaklavaEvent<AbstractNode, Graph>(this),
        beforeRemoveNode: new PreventableBaklavaEvent<AbstractNode, Graph>(this),
        removeNode: new BaklavaEvent<AbstractNode, Graph>(this),
        beforeAddConnection: new PreventableBaklavaEvent<IAddConnectionEventData, Graph>(this),
        addConnection: new BaklavaEvent<IConnection, Graph>(this),
        checkConnection: new PreventableBaklavaEvent<IAddConnectionEventData, Graph>(this),
        beforeRemoveConnection: new PreventableBaklavaEvent<IConnection, Graph>(this),
        removeConnection: new BaklavaEvent<IConnection, Graph>(this),
    } as const;

    public hooks = {
        save: new SequentialHook<IGraphState, Graph>(this),
        load: new SequentialHook<IGraphState, Graph>(this),
        checkConnection: new ParallelHook<IAddConnectionEventData, CheckConnectionHookResult, Graph>(this),
    } as const;

    public nodeEvents = createProxy<AbstractNode["events"]>();
    public nodeHooks = createProxy<AbstractNode["hooks"]>();

    public connectionEvents = createProxy<Connection["events"]>();

    /** List of all nodes in this graph */
    public get nodes(): ReadonlyArray<AbstractNode> {
        return this._nodes;
    }

    /** List of all connections in this graph */
    public get connections(): ReadonlyArray<Connection> {
        return this._connections;
    }

    /** Whether the graph is currently in the process of loading a saved graph */
    public get loading() {
        return this._loading;
    }

    /** Whether the graph is currently in the process of destroying itself */
    public get destroying() {
        return this._destroying;
    }

    public constructor(editor: Editor, template?: GraphTemplate) {
        this.editor = editor;
        this.template = template;
        editor.registerGraph(this);
    }

    /**
     * Add a node to the list of nodes.
     * @param node Instance of a node
     * @returns Instance of the node or undefined if the node was not added
     */
    public addNode<T extends AbstractNode>(node: T): T | undefined {
        if (this.events.beforeAddNode.emit(node).prevented) {
            return;
        }
        this.nodeEvents.addTarget(node.events);
        this.nodeHooks.addTarget(node.hooks);
        node.registerGraph(this);
        this._nodes.push(node);
        node.onPlaced();
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
            if (this.events.beforeRemoveNode.emit(node).prevented) {
                return;
            }
            const interfaces = [...Object.values(node.inputs), ...Object.values(node.outputs)];
            this.connections
                .filter((c) => interfaces.includes(c.from) || interfaces.includes(c.to))
                .forEach((c) => this.removeConnection(c));
            this._nodes.splice(this.nodes.indexOf(node), 1);
            this.events.removeNode.emit(node);
            node.onDestroy();
            this.nodeEvents.removeTarget(node.events);
            this.nodeHooks.removeTarget(node.hooks);
        }
    }

    /**
     * Add a connection to the list of connections.
     * @param from Start interface for the connection
     * @param to Target interface for the connection
     * @returns The created connection. If no connection could be created, returns `undefined`.
     */
    public addConnection(from: NodeInterface<any>, to: NodeInterface<any>): Connection | undefined {
        const checkConnectionResult = this.checkConnection(from, to);
        if (!checkConnectionResult.connectionAllowed) {
            return undefined;
        }

        if (this.events.beforeAddConnection.emit({ from, to }).prevented) {
            return;
        }

        for (const connectionToRemove of checkConnectionResult.connectionsInDanger) {
            const instance = this.connections.find((c) => c.id === connectionToRemove.id);
            if (instance) {
                this.removeConnection(instance);
            }
        }

        const c = new Connection(checkConnectionResult.dummyConnection.from, checkConnectionResult.dummyConnection.to);
        this.internalAddConnection(c);
        return c;
    }

    /**
     * Remove a connection from the list of connections.
     * @param connection Connection instance that should be removed.
     */
    public removeConnection(connection: Connection): void {
        if (this.connections.includes(connection)) {
            if (this.events.beforeRemoveConnection.emit(connection).prevented) {
                return;
            }
            connection.destruct();
            this._connections.splice(this.connections.indexOf(connection), 1);
            this.events.removeConnection.emit(connection);
            this.connectionEvents.removeTarget(connection.events);
        }
    }

    /**
     * Checks, whether a connection between two node interfaces would be valid.
     * @param from The starting node interface (must be an output interface)
     * @param to The target node interface (must be an input interface)
     * @returns Whether the connection is allowed or not.
     */
    public checkConnection(from: NodeInterface<any>, to: NodeInterface<any>): CheckConnectionResult {
        if (!from || !to) {
            return { connectionAllowed: false };
        }

        const fromNode = this.findNodeById(from.nodeId);
        const toNode = this.findNodeById(to.nodeId);
        if (fromNode && toNode && fromNode === toNode) {
            // connections must be between two separate nodes.
            return { connectionAllowed: false };
        }

        if (from.isInput && !to.isInput) {
            // reverse connection
            const tmp = from;
            from = to;
            to = tmp;
        }

        if (from.isInput || !to.isInput) {
            // connections are only allowed from input to output interface
            return { connectionAllowed: false };
        }

        // prevent duplicate connections
        if (this.connections.some((c) => c.from === from && c.to === to)) {
            return { connectionAllowed: false };
        }

        if (this.events.checkConnection.emit({ from, to }).prevented) {
            return { connectionAllowed: false };
        }

        const hookResults = this.hooks.checkConnection.execute({ from, to });
        if (hookResults.some((hr) => !hr.connectionAllowed)) {
            return { connectionAllowed: false };
        }

        const connectionsInDanger = Array.from(new Set(hookResults.flatMap((hr) => hr.connectionsInDanger)));
        return {
            connectionAllowed: true,
            dummyConnection: new DummyConnection(from, to),
            connectionsInDanger,
        };
    }

    /**
     * Finds the NodeInterface with the provided id, as long as it exists in this graph
     * @param id id of the NodeInterface to find
     * @returns The NodeInterface if found, otherwise undefined
     */
    public findNodeInterface(id: string): NodeInterface<any> | undefined {
        for (const node of this.nodes) {
            for (const k in node.inputs) {
                const nodeInput = node.inputs[k];
                if (nodeInput.id === id) {
                    return nodeInput;
                }
            }
            for (const k in node.outputs) {
                const nodeOutput = node.outputs[k];
                if (nodeOutput.id === id) {
                    return nodeOutput;
                }
            }
        }
    }

    /**
     * Finds the Node with the provided id, as long as it exists in this graph
     * @param id id of the Node to find
     * @returns The Node if found, otherwise undefined
     */
    public findNodeById(id: string): AbstractNode | undefined {
        return this.nodes.find((n) => n.id === id);
    }

    /**
     * Load a state
     * @param state State to load
     * @returns An array of warnings that occured during loading. If the array is empty, the state was successfully loaded.
     */
    public load(state: IGraphState): string[] {
        try {
            this._loading = true;
            const warnings: string[] = [];

            // Clear current state
            for (let i = this.connections.length - 1; i >= 0; i--) {
                this.removeConnection(this.connections[i]);
            }
            for (let i = this.nodes.length - 1; i >= 0; i--) {
                this.removeNode(this.nodes[i]);
            }

            // Load state
            this.id = state.id;
            this.inputs = state.inputs;
            this.outputs = state.outputs;

            for (const n of state.nodes) {
                // find node type
                const nodeInformation = this.editor.nodeTypes.get(n.type);
                if (!nodeInformation) {
                    warnings.push(`Node type ${n.type} is not registered`);
                    continue;
                }

                const node = new nodeInformation.type();
                this.addNode(node);
                node.load(n);
            }

            for (const c of state.connections) {
                const fromIf = this.findNodeInterface(c.from);
                const toIf = this.findNodeInterface(c.to);
                if (!fromIf) {
                    warnings.push(`Could not find interface with id ${c.from}`);
                    continue;
                } else if (!toIf) {
                    warnings.push(`Could not find interface with id ${c.to}`);
                    continue;
                } else {
                    const conn = new Connection(fromIf, toIf);
                    conn.id = c.id;
                    this.internalAddConnection(conn);
                }
            }

            this.hooks.load.execute(state);
            return warnings;
        } finally {
            this._loading = false;
        }
    }

    /**
     * Save a state
     * @returns Current state
     */
    public save(): IGraphState {
        const state: IGraphState = {
            id: this.id,
            nodes: this.nodes.map((n) => n.save()),
            connections: this.connections.map((c) => ({
                id: c.id,
                from: c.from.id,
                to: c.to.id,
            })),
            inputs: this.inputs,
            outputs: this.outputs,
        };
        return this.hooks.save.execute(state);
    }

    public destroy() {
        this._destroying = true;
        for (const n of this.nodes) {
            this.removeNode(n);
        }
        this.editor.unregisterGraph(this);
    }

    private internalAddConnection(c: Connection) {
        this.connectionEvents.addTarget(c.events);
        this._connections.push(c);
        this.events.addConnection.emit(c);
    }
}

import { v4 as uuidv4 } from "uuid";
import {
    BaklavaEvent,
    IBaklavaEventEmitter,
    IBaklavaTapable,
    PreventableBaklavaEvent,
    SequentialHook,
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

export class Graph implements IBaklavaEventEmitter, IBaklavaTapable {
    public id = uuidv4();
    public editor: Editor;
    public template?: GraphTemplate;

    public inputs: IGraphInterface[] = [];
    public outputs: IGraphInterface[] = [];

    protected _nodes: AbstractNode[] = [];
    protected _connections: Connection[] = [];

    public events = {
        beforeAddNode: new PreventableBaklavaEvent<AbstractNode>(),
        addNode: new BaklavaEvent<AbstractNode>(),
        beforeRemoveNode: new PreventableBaklavaEvent<AbstractNode>(),
        removeNode: new BaklavaEvent<AbstractNode>(),
        beforeAddConnection: new PreventableBaklavaEvent<IAddConnectionEventData>(),
        addConnection: new BaklavaEvent<IConnection>(),
        checkConnection: new PreventableBaklavaEvent<IAddConnectionEventData>(),
        beforeRemoveConnection: new PreventableBaklavaEvent<IConnection>(),
        removeConnection: new BaklavaEvent<IConnection>(),
    };

    public hooks = {
        save: new SequentialHook<IGraphState>(),
        load: new SequentialHook<IGraphState>(),
    };

    /** List of all nodes in this graph */
    public get nodes(): ReadonlyArray<AbstractNode> {
        return this._nodes;
    }

    /** List of all connections in this graph */
    public get connections(): ReadonlyArray<Connection> {
        return this._connections;
    }

    public constructor(editor: Editor, template?: GraphTemplate) {
        this.editor = editor;
        this.template = template;
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
        node.registerGraph(this);
        this._nodes.push(node);
        this.events.addNode.emit(node);
        node.onPlaced();
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
            const interfaces = [...Object.values(node.inputs), ...Object.values(node.outputs)];
            this.connections
                .filter((c) => interfaces.includes(c.from) || interfaces.includes(c.to))
                .forEach((c) => this.removeConnection(c));
            this._nodes.splice(this.nodes.indexOf(node), 1);
            this.events.removeNode.emit(node);
            node.onDestroy();
        }
    }

    /**
     * Add a connection to the list of connections.
     * @param from Start interface for the connection
     * @param to Target interface for the connection
     * @returns The created connection. If no connection could be created, returns `undefined`.
     */
    public addConnection(from: NodeInterface<any>, to: NodeInterface<any>): Connection | undefined {
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
    public checkConnection(from: NodeInterface<any>, to: NodeInterface<any>): false | DummyConnection {
        if (!from || !to) {
            return false;
        }

        const fromNode = this.findNodeByInterface(from.id);
        const toNode = this.findNodeByInterface(to.id);
        if (fromNode && toNode && fromNode === toNode) {
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

    public findNodeByInterface(id: string): AbstractNode | undefined {
        for (const node of this.nodes) {
            if (
                Object.values(node.inputs).some((intf) => intf.id === id) ||
                Object.values(node.outputs).some((intf) => intf.id === id)
            ) {
                return node;
            }
        }
    }

    /**
     * Load a state
     * @param state State to load
     */
    public load(state: IGraphState): void {
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
                console.warn(`Node type ${n.type} is not registered`);
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
}

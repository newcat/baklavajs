import { BaklavaEvent, PreventableBaklavaEvent } from "@baklavajs/events";
import { Connection, DummyConnection, IConnection, IConnectionState } from "./connection";
import { IAddConnectionEventData } from "./eventDataTypes";
import { AbstractNode, INodeState } from "./node";
import { NodeInterface } from "./nodeInterface";

export interface IGraphState extends Record<string, any> {
    nodes: Array<INodeState<unknown, unknown>>;
    connections: IConnectionState[];
}

export class Graph {
    public inputs: NodeInterface[] = [];
    public outputs: NodeInterface[] = [];

    private _graphs: Graph[] = [];
    private _nodes: AbstractNode[] = [];
    private _connections: Connection[] = [];

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

    /** List of all nodes in this graph */
    public get nodes(): ReadonlyArray<AbstractNode> {
        return this._nodes;
    }

    /** List of all connections in this graph */
    public get connections(): ReadonlyArray<Connection> {
        return this._connections;
    }

    /** List of all sub-graphs in this graph */
    public get graphs(): ReadonlyArray<Graph> {
        return this._graphs;
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

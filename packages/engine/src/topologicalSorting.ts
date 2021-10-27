import { AbstractNode, Graph, GRAPH_NODE_TYPE_PREFIX, IConnection, IGraphNode } from "@baklavajs/core";

export interface ITopologicalSortingResult {
    calculationOrder: AbstractNode[];
    connectionsFromNode: Map<AbstractNode, IConnection[]>;
    /** NodeInterface.id -> parent Node.id */
    interfaceIdToNodeId: Map<string, string>;
}

export interface IExpandedGraph {
    nodes: ReadonlyArray<AbstractNode>;
    connections: ReadonlyArray<IConnection>;
}

export class CycleError extends Error {
    public constructor() {
        super("Cycle detected");
    }
}

function expandNodesAndConnections(
    nodes: ReadonlyArray<AbstractNode>,
    connections: ReadonlyArray<IConnection>,
): IExpandedGraph {
    const graphNodes: Array<IGraphNode & AbstractNode> = [];
    let expandedNodes: AbstractNode[] = [];
    let expandedConnections: IConnection[] = connections.slice();

    nodes.forEach((n) => {
        if (n.type.startsWith(GRAPH_NODE_TYPE_PREFIX)) {
            graphNodes.push(n as IGraphNode & AbstractNode);
        } else {
            expandedNodes.push(n);
        }
    });

    graphNodes.forEach((n) => {
        if (n.graph) {
            const innerGraph = expandNodesAndConnections(n.graph.nodes, n.graph.connections);
            expandedNodes = expandedNodes.concat(innerGraph.nodes);
            expandedConnections = expandedConnections.concat(innerGraph.connections);
        }
    });

    return {
        nodes: expandedNodes,
        connections: expandedConnections,
    };
}

function isString(v: string | undefined): v is string {
    return typeof v === "string";
}

/** Expand a graph, which may contain subgraphs, into a flat list of nodes and connections */
export function expandGraph(graph: Graph): IExpandedGraph {
    return expandNodesAndConnections(graph.nodes, graph.connections);
}

/** Uses Kahn's algorithm to topologically sort the nodes in the graph */
export function sortTopologically(graph: Graph): ITopologicalSortingResult;
/** Uses Kahn's algorithm to topologically sort the nodes in the graph */
export function sortTopologically(
    nonExpandedNodes: ReadonlyArray<AbstractNode>,
    nonExpandedConnections: ReadonlyArray<IConnection>,
): ITopologicalSortingResult;
/** This overload is only used for internal purposes */
export function sortTopologically(
    nonExpandedNodesOrGraph: ReadonlyArray<AbstractNode> | Graph,
    nonExpandedConnections?: ReadonlyArray<IConnection>,
): ITopologicalSortingResult;
export function sortTopologically(
    nonExpandedNodesOrGraph: ReadonlyArray<AbstractNode> | Graph,
    nonExpandedConnections?: ReadonlyArray<IConnection>,
): ITopologicalSortingResult {
    /** NodeInterface.id -> parent Node.id */
    const interfaceIdToNodeId = new Map<string, string>();

    /** Node.id -> set of connected node.id */
    const adjacency = new Map<string, Set<string>>();
    const connectionsFromNode = new Map<AbstractNode, IConnection[]>();

    let expandedGraph: IExpandedGraph;
    if (nonExpandedNodesOrGraph instanceof Graph) {
        expandedGraph = expandGraph(nonExpandedNodesOrGraph);
    } else {
        if (!nonExpandedConnections) {
            throw new Error("Invalid argument value: expected array of connections");
        }
        expandedGraph = expandNodesAndConnections(nonExpandedNodesOrGraph, nonExpandedConnections);
    }
    const { nodes, connections } = expandedGraph;

    nodes.forEach((n) => {
        Object.values(n.inputs).forEach((intf) => interfaceIdToNodeId.set(intf.id, n.id));
        Object.values(n.outputs).forEach((intf) => interfaceIdToNodeId.set(intf.id, n.id));
    });

    // build adjacency list
    nodes.forEach((n) => {
        const connectionsFromCurrentNode = connections.filter(
            (c) => c.from && interfaceIdToNodeId.get(c.from.id) === n.id,
        );
        const adjacentNodes = new Set<string>(
            connectionsFromCurrentNode.map((c) => interfaceIdToNodeId.get(c.to.id)).filter(isString),
        );
        adjacency.set(n.id, adjacentNodes);
        connectionsFromNode.set(n, connectionsFromCurrentNode);
    });

    // startNodes are all nodes that don't have any input connected
    const startNodes = nodes.slice();
    connections.forEach((c) => {
        const index = startNodes.findIndex((n) => interfaceIdToNodeId.get(c.to.id) === n.id);
        if (index >= 0) {
            startNodes.splice(index, 1);
        }
    });

    const sorted: AbstractNode[] = [];

    while (startNodes.length > 0) {
        const n = startNodes.pop()!;
        sorted.push(n);
        const nodesConnectedFromN = adjacency.get(n.id)!;
        while (nodesConnectedFromN.size > 0) {
            const mId: string = nodesConnectedFromN.values().next()!.value;
            nodesConnectedFromN.delete(mId);
            if (Array.from(adjacency.values()).every((connectedNodes) => !connectedNodes.has(mId))) {
                const m = nodes.find((node) => node.id === mId)!;
                startNodes.push(m);
            }
        }
    }

    if (Array.from(adjacency.values()).some((c) => c.size > 0)) {
        throw new CycleError();
    }

    return {
        calculationOrder: sorted,
        connectionsFromNode,
        interfaceIdToNodeId,
    };
}

/** Checks whether a graph contains a cycle */
export function containsCycle(graph: Graph): boolean;
/** Checks whether the provided set of nodes and connections contains a cycle */
export function containsCycle(nodes: ReadonlyArray<AbstractNode>, connections: ReadonlyArray<IConnection>): boolean;
export function containsCycle(
    nodesOrGraph: ReadonlyArray<AbstractNode> | Graph,
    connections?: ReadonlyArray<IConnection>,
): boolean {
    try {
        sortTopologically(nodesOrGraph, connections);
        return true;
    } catch (err) {
        if (err instanceof CycleError) {
            return false;
        }
        throw err;
    }
}

import { AbstractNode, Graph, GRAPH_NODE_TYPE_PREFIX, IConnection, IGraphNode } from "@baklavajs/core";

export interface IOrderCalculationResult {
    calculationOrder: AbstractNode[];
    connectionsFromNode: Map<AbstractNode, IConnection[]>;
}

export interface IExpandedGraph {
    nodes: ReadonlyArray<AbstractNode>;
    connections: ReadonlyArray<IConnection>;
}

function getNodesAndConnections(
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
            const innerGraph = getNodesAndConnections(n.graph.nodes, n.graph.connections);
            expandedNodes = expandedNodes.concat(innerGraph.nodes);
            expandedConnections = expandedConnections.concat(innerGraph.connections);
        }
    });

    return {
        nodes: expandedNodes,
        connections: expandedConnections,
    };
}

/** Expand a graph, which may contain subgraphs, into a flat list of nodes and connections */
export function expandGraph(graph: Graph): IExpandedGraph {
    return getNodesAndConnections(graph.nodes, graph.connections);
}

export function calculateOrder(
    nonExpandedNodes: ReadonlyArray<AbstractNode>,
    nonExpandedConnections: ReadonlyArray<IConnection>,
): IOrderCalculationResult {
    /** NodeInterface.id -> parent Node.id */
    const interfaceIdToNodeId = new Map<string, string>();

    /** Node.id -> set of connected node.id */
    const adjacency = new Map<string, Set<string>>();
    const connectionsFromNode = new Map<AbstractNode, IConnection[]>();

    const { nodes, connections } = getNodesAndConnections(nonExpandedNodes, nonExpandedConnections);

    nodes.forEach((n) => {
        Object.values(n.inputs).forEach((intf) => interfaceIdToNodeId.set(intf.id, n.id));
        Object.values(n.outputs).forEach((intf) => interfaceIdToNodeId.set(intf.id, n.id));
    });

    // build adjacency list
    nodes.forEach((n) => {
        const connectionsFromCurrentNode = connections.filter(
            (c) => c.from && interfaceIdToNodeId.get(c.from.id) === n.id,
        );
        adjacency.set(n.id, new Set(connectionsFromCurrentNode.map((c) => interfaceIdToNodeId.get(c.to.id)!)));
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
        throw new Error("Cycle detected");
    }

    return {
        calculationOrder: sorted,
        connectionsFromNode,
    };
}

export function containsCycle(nodes: ReadonlyArray<AbstractNode>, connections: ReadonlyArray<IConnection>): boolean {
    try {
        calculateOrder(nodes, connections);
        return true;
    } catch (err) {
        return false;
    }
}

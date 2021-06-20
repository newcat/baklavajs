import { AbstractNode, Graph, GRAPH_NODE_TYPE_PREFIX, IConnection, IGraphNode, NodeInterface } from "@baklavajs/core";

interface ITreeNode {
    n?: AbstractNode;
    children: ITreeNode[];
}

export interface IOrderCalculationResult {
    calculationOrder: AbstractNode[];
    rootNodes: AbstractNode[];
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
    roots?: AbstractNode[],
): IOrderCalculationResult {
    const interfaceToNodes = new Map<NodeInterface, AbstractNode>();
    const adjacency = new Map<AbstractNode, AbstractNode[]>();
    const connectionsFromNode = new Map<AbstractNode, IConnection[]>();

    const { nodes, connections } = getNodesAndConnections(nonExpandedNodes, nonExpandedConnections);

    nodes.forEach((n) => {
        Object.values(n.inputs).forEach((intf) => interfaceToNodes.set(intf, n));
        Object.values(n.outputs).forEach((intf) => interfaceToNodes.set(intf, n));
    });

    // build adjacency list
    nodes.forEach((n) => {
        const connectionsToCurrentNode = connections.filter((c) => c.to && interfaceToNodes.get(c.to) === n);
        const connectionsFromCurrentNode = connections.filter((c) => c.from && interfaceToNodes.get(c.from) === n);
        adjacency.set(
            n,
            connectionsToCurrentNode.map((c) => interfaceToNodes.get(c.from)!),
        );
        connectionsFromNode.set(n, connectionsFromCurrentNode);
    });

    // DFS for initial tree building and cycle detection
    const outputs: AbstractNode[] = roots || nodes.filter((n) => getOutputInterfacesWithPort(n).length === 0);
    const root: ITreeNode = {
        children: outputs.map((o) => ({ n: o, children: [] })),
    };

    findDescendants(root, [], adjacency);

    // BFS with stack to find calculation order
    const queue: ITreeNode[] = [];
    const stack: Array<AbstractNode | undefined> = [];
    queue.push(root);

    while (queue.length > 0) {
        const current = queue.shift()!;
        current.children.forEach((c) => {
            stack.push(c.n);
            queue.push(c);
        });
    }

    // Pop stack to reverse the order
    const calculationOrder: AbstractNode[] = [];
    while (stack.length > 0) {
        const n = stack.pop();
        if (n && !calculationOrder.includes(n)) {
            calculationOrder.push(n);
        }
    }
    return { calculationOrder, rootNodes: outputs, connectionsFromNode };
}

function findDescendants(tn: ITreeNode, ancestors: AbstractNode[], adjacency: Map<AbstractNode, AbstractNode[]>) {
    for (const c of tn.children) {
        if (ancestors.includes(c.n!)) {
            throw new Error("Cycle detected");
        }

        ancestors.unshift(c.n!);
        c.children = c.children.concat(
            adjacency.get(c.n!)?.map((n) => ({ n, children: new Array<ITreeNode>() })) ?? [],
        );
        findDescendants(c, ancestors, adjacency);
        ancestors.shift();
    }
}

function getOutputInterfacesWithPort(node: AbstractNode): NodeInterface[] {
    return Object.values(node.outputs).filter((output) => output.port) as NodeInterface[];
}

export function containsCycle(nodes: ReadonlyArray<AbstractNode>, connections: ReadonlyArray<IConnection>): boolean {
    try {
        calculateOrder(nodes, connections);
        return true;
    } catch (err) {
        return false;
    }
}

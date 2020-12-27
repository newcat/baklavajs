import { AbstractNode, IConnection, NodeInterface } from "@baklavajs/core";

interface ITreeNode {
    n?: AbstractNode;
    children: ITreeNode[];
}

interface IOrderCalculationResult {
    calculationOrder: AbstractNode[];
    rootNodes: AbstractNode[];
}

const isEmpty = (obj: any) => [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

export function calculateOrder(
    nodes: ReadonlyArray<AbstractNode>,
    connections: ReadonlyArray<IConnection>,
    roots?: AbstractNode[]
): IOrderCalculationResult {
    const adjacency = new Map<AbstractNode, AbstractNode[]>();

    // build adjacency list
    nodes.forEach((n) => {
        adjacency.set(
            n,
            connections.filter((c) => c.to && c.to.parent === n).map((c) => c.from.parent!)
        );
    });

    // DFS for initial tree building and cycle detection
    const outputs: AbstractNode[] = roots || nodes.filter((n) => isEmpty(getOutputInterfacesWithPort(n)));
    const root: ITreeNode = {
        children: outputs.map((o) => ({ n: o, children: [] })),
    };

    findDescendants(root, [], adjacency);

    // BFS with stack to find calculation order
    const queue: ITreeNode[] = [];
    const stack: AbstractNode[] = [];
    queue.push(root);

    while (queue.length > 0) {
        const current = queue.shift()!;
        current.children.forEach((c) => {
            stack.push(c.n!);
            queue.push(c);
        });
    }

    // Pop stack to reverse the order
    const calculationOrder: AbstractNode[] = [];
    while (stack.length > 0) {
        const n = stack.pop()!;
        if (!calculationOrder.includes(n)) {
            calculationOrder.push(n);
        }
    }
    return { calculationOrder, rootNodes: outputs };
}

function findDescendants(tn: ITreeNode, ancestors: AbstractNode[], adjacency: Map<AbstractNode, AbstractNode[]>) {
    for (const c of tn.children) {
        if (ancestors.includes(c.n!)) {
            throw new Error("Cycle detected");
        }

        ancestors.unshift(c.n!);
        c.children = c.children.concat(adjacency.get(c.n!)!.map((n) => ({ n, children: new Array<ITreeNode>() })));
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

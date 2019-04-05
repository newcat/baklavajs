import { Node, IConnection } from "@baklavajs/core";

interface ITreeNode {
    n?: Node;
    children: ITreeNode[];
}

const isEmpty = (obj: any) =>
    [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;

export function calculateOrder(nodes: ReadonlyArray<Node>, connections: ReadonlyArray<IConnection>, roots?: Node[]): Node[] {

    const adjacency = new Map<Node, Node[]>();

    // build adjacency list
    nodes.forEach((n) => {
        adjacency.set(n,
            connections
                .filter((c) => c.to && c.to.parent === n)
                .map((c) => c.from.parent)
        );
    });

    // DFS for initial tree building and cycle detection
    const outputs: Node[] = roots || nodes.filter((n) => isEmpty(n.outputInterfaces));
    const root: ITreeNode = {
        children: outputs.map((o) => ({ n: o, children: [] }))
    };

    findDescendants(root, [], adjacency);

    // BFS with stack to find calculation order
    const queue: ITreeNode[] = [];
    const stack: Node[] = [];
    queue.push(root);

    while (queue.length > 0) {
        const current = queue.shift()!;
        current.children.forEach((c) => {
            stack.push(c.n!);
            queue.push(c);
        });
    }

    // Pop stack to reverse the order
    const calculationOrder: Node[] = [];
    while (stack.length > 0) {
        const n = stack.pop()!;
        if (!calculationOrder.includes(n)) {
            calculationOrder.push(n);
        }
    }
    return calculationOrder;

}

function findDescendants(tn: ITreeNode, ancestors: Node[], adjacency: Map<Node, Node[]>) {
    for (const c of tn.children) {

        if (ancestors.includes(c.n!)) {
            throw new Error("Cycle detected");
        }

        ancestors.unshift(c.n!);
        c.children = c.children.concat(adjacency.get(c.n!)!
            .map((n) => ({ n, children: new Array<ITreeNode>() }))
        );
        findDescendants(c, ancestors, adjacency);
        ancestors.shift();

    }
}

export function containsCycle(nodes: ReadonlyArray<Node>, connections: ReadonlyArray<IConnection>): boolean {
    try {
        calculateOrder(nodes, connections);
        return true;
    } catch (err) {
        return false;
    }
}

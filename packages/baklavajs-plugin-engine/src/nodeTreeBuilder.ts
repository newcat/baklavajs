import { INode, IConnection } from "../../baklavajs-core/types";

interface ITreeNode {
    n?: INode;
    children: ITreeNode[];
}

interface IOrderCalculationResult {
    calculationOrder: INode[];
    rootNodes: INode[];
}

const isEmpty = (obj: any) =>
    [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;

export function calculateOrder(nodes: ReadonlyArray<INode>, connections: ReadonlyArray<IConnection>, roots?: INode[]):
    IOrderCalculationResult {

    const adjacency = new Map<INode, INode[]>();

    // build adjacency list
    nodes.forEach((n) => {
        adjacency.set(n,
            connections
                .filter((c) => c.to && c.to.parent === n)
                .map((c) => c.from.parent)
        );
    });

    // DFS for initial tree building and cycle detection
    const outputs: INode[] = roots || nodes.filter((n) => isEmpty(n.outputInterfaces));
    const root: ITreeNode = {
        children: outputs.map((o) => ({ n: o, children: [] }))
    };

    findDescendants(root, [], adjacency);

    // BFS with stack to find calculation order
    const queue: ITreeNode[] = [];
    const stack: INode[] = [];
    queue.push(root);

    while (queue.length > 0) {
        const current = queue.shift()!;
        current.children.forEach((c) => {
            stack.push(c.n!);
            queue.push(c);
        });
    }

    // Pop stack to reverse the order
    const calculationOrder: INode[] = [];
    while (stack.length > 0) {
        const n = stack.pop()!;
        if (!calculationOrder.includes(n)) {
            calculationOrder.push(n);
        }
    }
    return { calculationOrder, rootNodes: outputs };

}

function findDescendants(tn: ITreeNode, ancestors: INode[], adjacency: Map<INode, INode[]>) {
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

export function containsCycle(nodes: ReadonlyArray<INode>, connections: ReadonlyArray<IConnection>): boolean {
    try {
        calculateOrder(nodes, connections);
        return true;
    } catch (err) {
        return false;
    }
}

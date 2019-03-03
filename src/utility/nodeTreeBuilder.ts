import isEmpty from "lodash/isEmpty";

import { Node, IConnection } from "../model";

interface ITreeNode {
    n?: Node;
    children: ITreeNode[];
}

export class NodeTreeBuilder {

    private adjacency = new Map<Node, Node[]>();

    public calculateTree(nodes: Node[], connections: IConnection[]) {

        this.adjacency.clear();

        // build adjacency list
        nodes.forEach((n) => {
            this.adjacency.set(n,
                connections
                    .filter((c) => c.to && c.to.parent === n)
                    .map((c) => c.from.parent)
            );
        });

        // DFS for initial tree building and cycle detection
        const outputs: Node[] = nodes.filter((n) => isEmpty(n.outputInterfaces));
        const root: ITreeNode = {
            children: outputs.map((o) => ({ n: o, children: [] }))
        };

        this.findDescendants(root, []);

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

    private findDescendants(tn: ITreeNode, ancestors: Node[]) {
        for (const c of tn.children) {

            if (ancestors.includes(c.n!)) {
                throw new Error("Cycle detected");
            }

            ancestors.unshift(c.n!);
            c.children = c.children.concat(
                this.adjacency.get(c.n!)!
                    .map((n) => ({ n, children: new Array<ITreeNode>() }))
            );
            this.findDescendants(c, ancestors);
            ancestors.shift();

        }
    }

}

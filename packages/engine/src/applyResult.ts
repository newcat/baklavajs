import { AbstractNode, Editor } from "@baklavajs/core";
import { CalculationResult } from "./baseEngine";

/**
 * Apply the calculation result values to the output interfaces in the graph
 * @param result Calculation result
 * @param editor Editor instance
 */
export function applyResult(result: CalculationResult, editor: Editor): void {
    const nodeMap: Map<string, AbstractNode> = new Map();
    editor.graphs.forEach((g) => {
        g.nodes.forEach((n) => nodeMap.set(n.id, n));
    });

    result.forEach((intfValues, nodeId) => {
        const node = nodeMap.get(nodeId);
        if (!node) {
            return;
        }

        intfValues.forEach((value, intfKey) => {
            const intf = node.outputs[intfKey];
            if (!intf) {
                return;
            }

            intf.value = value;
        });
    });
}

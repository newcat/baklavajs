import { AbstractNode, Editor, CalculationResult, IConnection } from "@baklavajs/core";

export interface ApplyResultOptions {
    transferData?: (value: any, connection: IConnection) => any;
}

/**
 * Apply the calculation result values to the output interfaces in the graph and
 * propagate updated output values to connected input interfaces.
 * @param result Calculation result
 * @param editor Editor instance
 * @param options Optional hooks for applying connection data transformations
 */
export function applyResult(result: CalculationResult, editor: Editor, options?: ApplyResultOptions): void {
    const nodeMap: Map<string, AbstractNode> = new Map();
    editor.graphs.forEach((g) => {
        g.nodes.forEach((n) => nodeMap.set(n.id, n));
    });

    const outputValues = new Map<string, any>();

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
            outputValues.set(intf.id, value);
        });
    });

    editor.graphs.forEach((g) => {
        const updatedMultiInputs = new Set<string>();
        const getTransferredValue = (connection: IConnection) => {
            const value = outputValues.get(connection.from.id) ?? connection.from.value;
            return options?.transferData?.(value, connection) ?? value;
        };

        g.connections.forEach((c) => {
            if (!outputValues.has(c.from.id)) {
                return;
            }

            if (c.to.allowMultipleConnections) {
                updatedMultiInputs.add(c.to.id);
            } else {
                c.to.value = getTransferredValue(c);
            }
        });

        updatedMultiInputs.forEach((inputId) => {
            const connections = g.connections.filter((c) => c.to.id === inputId);
            const input = connections[0]?.to;
            if (input) {
                input.value = connections.map((c) => getTransferredValue(c));
            }
        });
    });
}

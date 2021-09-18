import { Connection, Editor, NodeInterface } from "@baklavajs/core";
import { BaseEngine, CalculationResult } from "./baseEngine";

export const allowMultipleConnections = <T extends Array<any>>(intf: NodeInterface<T>) => {
    intf.allowMultipleConnections = true;
};

export class DependencyEngine<CalculationData = any> extends BaseEngine<CalculationData, []> {
    public constructor(editor: Editor, calculateOnChange = false) {
        super(editor, calculateOnChange);
        this.editor.graphEvents.addConnection.subscribe(this, (c, graph) => {
            // Delete all other connections to the target interface
            // if only one connection to the input interface is allowed
            if (!c.to.allowMultipleConnections) {
                graph.connections
                    .filter((conn) => conn.from !== c.from && conn.to === c.to)
                    .forEach((conn) => graph.removeConnection(conn));
            }
        });
    }

    protected async runCalculation(calculationData: CalculationData): Promise<CalculationResult> {
        if (!this.order) {
            throw new Error("runCalculation called without order being calculated before");
        }

        const { calculationOrder, connectionsFromNode } = this.order;

        // gather all values of the unconnected inputs
        // maps NodeInterface.id -> value
        // the reason it is done here and not during calculation is that this
        // way we prevent race conditions because calculations can be async
        const inputValues = new Map<string, any>();
        for (const n of calculationOrder) {
            Object.values(n.inputs).forEach((ni) => {
                if (ni.connectionCount === 0) {
                    inputValues.set(ni.id, ni.value);
                }
            });
        }

        const result: CalculationResult = new Map();
        for (const n of calculationOrder) {
            if (!n.calculate) {
                continue;
            }

            const inputsForNode: Record<string, any> = {};
            Object.entries(n.inputs).forEach(([k, v]) => {
                if (!inputValues.has(v.id)) {
                    throw new Error(
                        `Could not find value for interface ${v.id}\n` +
                            "This is likely a Baklava internal issue. Please report it on GitHub.",
                    );
                }
                inputsForNode[k] = inputValues.get(v.id);
            });

            const r = await n.calculate(inputsForNode, calculationData);

            // validate return
            this.validateNodeCalculationOutput(n, r);

            result.set(n.id, new Map(Object.entries(r)));
            if (connectionsFromNode.has(n)) {
                connectionsFromNode.get(n)!.forEach((c) => {
                    const v = (c as Connection).hooks.transfer.execute(c.from.value);
                    if (c.to.allowMultipleConnections) {
                        if (inputValues.has(c.to.id)) {
                            (inputValues.get(c.to.id)! as Array<any>).push(v);
                        } else {
                            inputValues.set(c.to.id, [v]);
                        }
                    } else {
                        inputValues.set(c.to.id, v);
                    }
                });
            }
        }

        return result;
    }

    protected onChange(recalculateOrder: boolean): void {
        this.recalculateOrder = recalculateOrder || this.recalculateOrder;
        if (this.calculateOnChange) {
            this.calculateWithoutData();
        }
    }
}

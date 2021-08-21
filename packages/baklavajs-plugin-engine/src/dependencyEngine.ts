import { AbstractNode, Connection, Editor } from "@baklavajs/core";
import { BaseEngine, CalculationResult } from "./baseEngine";
import { calculateOrder, IOrderCalculationResult } from "./nodeTreeBuilder";

export class DependencyEngine<CalculationData = any> extends BaseEngine<CalculationData, []> {
    private orderCalculationData?: IOrderCalculationResult;
    private recalculateOrder = false;

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

    /**
     * Force the engine to recalculate the node execution order.
     * This is normally done automatically. Use this method if the
     * default change detection does not work in your scenario.
     */
    public calculateOrder(): void {
        this.orderCalculationData = calculateOrder(this.editor.graph.nodes, this.editor.graph.connections);
        this.recalculateOrder = false;
    }

    protected async runCalculation(calculationData: CalculationData): Promise<CalculationResult> {
        if (this.recalculateOrder) {
            this.calculateOrder();
        }

        const { calculationOrder, connectionsFromNode } = this.orderCalculationData!;

        const results: Map<AbstractNode, any> = new Map();
        for (const n of calculationOrder) {
            if (!n.calculate) {
                continue;
            }
            const inputs: Record<string, any> = {};
            Object.entries(n.inputs).forEach(([k, v]) => {
                inputs[k] = v.value;
            });
            const r = await n.calculate(inputs, calculationData);
            if (typeof r === "object") {
                Object.entries(r).forEach(([k, v]) => {
                    if (n.outputs[k]) {
                        n.outputs[k].value = v;
                    }
                });
            }
            if (connectionsFromNode.has(n)) {
                connectionsFromNode.get(n)!.forEach((c) => {
                    c.to.value = (c as Connection).hooks.transfer.execute(c.from.value);
                });
            }
        }

        // TODO:
        return new Map();
    }

    protected onChange(recalculateOrder: boolean): void {
        this.recalculateOrder = recalculateOrder || this.recalculateOrder;
        this.calculateWithoutData();
    }
}

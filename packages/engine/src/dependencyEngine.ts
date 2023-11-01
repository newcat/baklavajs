import type { Editor, Graph, NodeInterface } from "@baklavajs/core";
import { BaseEngine, CalculationResult } from "./baseEngine";
import { ITopologicalSortingResult, sortTopologically } from "./topologicalSorting";

export const allowMultipleConnections = <T extends Array<any>>(intf: NodeInterface<T>) => {
    intf.allowMultipleConnections = true;
};

export class DependencyEngine<CalculationData = any> extends BaseEngine<CalculationData, []> {
    private order: Map<string, ITopologicalSortingResult> = new Map();

    public constructor(editor: Editor) {
        super(editor);
    }

    public override start() {
        super.start();
        this.recalculateOrder = true;
        void this.calculateWithoutData();
    }

    public override async runGraph(
        graph: Graph,
        inputs: Map<string, any>,
        calculationData: CalculationData,
    ): Promise<CalculationResult> {
        if (!this.order.has(graph.id)) {
            this.order.set(graph.id, sortTopologically(graph));
        }

        const { calculationOrder, connectionsFromNode } = this.order.get(graph.id)!;

        const result: CalculationResult = new Map();
        for (const n of calculationOrder) {
            const inputsForNode: Record<string, any> = {};
            Object.entries(n.inputs).forEach(([k, v]) => {
                inputsForNode[k] = this.getInterfaceValue(inputs, v.id);
            });

            this.events.beforeNodeCalculation.emit({ inputValues: inputsForNode, node: n });

            let r: any;
            if (n.calculate) {
                r = await n.calculate(inputsForNode, { globalValues: calculationData, engine: this });
            } else {
                r = {};
                for (const [k, intf] of Object.entries(n.outputs)) {
                    r[k] = this.getInterfaceValue(inputs, intf.id);
                }
            }

            this.validateNodeCalculationOutput(n, r);
            this.events.afterNodeCalculation.emit({ outputValues: r, node: n });

            result.set(n.id, new Map(Object.entries(r)));
            if (connectionsFromNode.has(n)) {
                connectionsFromNode.get(n)!.forEach((c) => {
                    const intfKey = Object.entries(n.outputs).find(([, intf]) => intf.id === c.from.id)?.[0];
                    if (!intfKey) {
                        throw new Error(
                            `Could not find key for interface ${c.from.id}\n` +
                                "This is likely a Baklava internal issue. Please report it on GitHub.",
                        );
                    }
                    const v = this.hooks.transferData.execute(r[intfKey], c);
                    if (c.to.allowMultipleConnections) {
                        if (inputs.has(c.to.id)) {
                            (inputs.get(c.to.id)! as Array<any>).push(v);
                        } else {
                            inputs.set(c.to.id, [v]);
                        }
                    } else {
                        inputs.set(c.to.id, v);
                    }
                });
            }
        }

        return result;
    }

    protected override async execute(calculationData: CalculationData): Promise<CalculationResult> {
        if (this.recalculateOrder) {
            this.order.clear();
            this.recalculateOrder = false;
        }

        // Gather all values of the unconnected inputs.
        // maps NodeInterface.id -> value
        // The reason it is done here and not during calculation is
        // that this way we prevent race conditions because calculations can be async.
        // For the same reason, we need to gather all output values for nodes that do not have a calculate function.
        const inputValues = new Map<string, any>();
        for (const n of this.editor.graph.nodes) {
            Object.values(n.inputs).forEach((ni) => {
                if (ni.connectionCount === 0) {
                    inputValues.set(ni.id, ni.value);
                }
            });
            if (!n.calculate) {
                Object.values(n.outputs).forEach((ni) => {
                    inputValues.set(ni.id, ni.value);
                });
            }
        }

        return await this.runGraph(this.editor.graph, inputValues, calculationData);
    }

    protected onChange(recalculateOrder: boolean): void {
        this.recalculateOrder = recalculateOrder || this.recalculateOrder;
        void this.calculateWithoutData();
    }

    private getInterfaceValue(values: Map<string, any>, id: string): any {
        if (!values.has(id)) {
            throw new Error(
                `Could not find value for interface ${id}\n` +
                    "This is likely a Baklava internal issue. Please report it on GitHub.",
            );
        }
        return values.get(id);
    }
}

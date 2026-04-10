import type { Editor, Graph, NodeInterface, CalculationResult, IGraphNode } from "@baklavajs/core";
import { BaseEngine } from "./baseEngine";
import { ITopologicalSortingResult, sortTopologically } from "./topologicalSorting";

function hasSubgraph(node: unknown): node is IGraphNode {
    return typeof node === "object" && node !== null && "subgraph" in node;
}

export const allowMultipleConnections = <T extends Array<any>>(intf: NodeInterface<T>) => {
    intf.allowMultipleConnections = true;
};

export class DependencyEngine<CalculationData = any> extends BaseEngine<CalculationData, []> {
    private order: Map<string, ITopologicalSortingResult> = new Map();
    private snapshotCache: Map<string, Map<string, any>> | null = null;

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

        // Pre-snapshot all input values including subgraphs to prevent race conditions
        // with async calculations. Without this, subgraph inputs would be read live
        // when the GraphNode is reached during calculation, not at the start.
        this.snapshotCache = new Map();
        this.snapshotAllGraphs(this.editor.graph);

        try {
            const inputValues = this.getInputValues(this.editor.graph);
            return await this.runGraph(this.editor.graph, inputValues, calculationData);
        } finally {
            this.snapshotCache = null;
        }
    }

    private snapshotAllGraphs(graph: Graph): void {
        const inputs = this.computeInputValues(graph);
        this.snapshotCache!.set(graph.id, inputs);
        for (const node of graph.nodes) {
            if (hasSubgraph(node) && node.subgraph) {
                this.snapshotAllGraphs(node.subgraph);
            }
        }
    }

    public getInputValues(graph: Graph): Map<string, any> {
        if (this.snapshotCache?.has(graph.id)) {
            // Return a copy so that runGraph() can mutate it (propagating values)
            // without corrupting the snapshot.
            return new Map(this.snapshotCache.get(graph.id));
        }
        return this.computeInputValues(graph);
    }

    private computeInputValues(graph: Graph): Map<string, any> {
        // Gather all values of the unconnected inputs.
        // maps NodeInterface.id -> value
        // The reason it is done here and not during calculation is
        // that this way we prevent race conditions because calculations can be async.
        // For the same reason, we need to gather all output values for nodes that do not have a calculate function.
        const inputValues = new Map<string, any>();
        for (const n of graph.nodes) {
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
        return inputValues;
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

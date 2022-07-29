import { AbstractNode, Graph, INodeUpdateEventData } from "@baklavajs/core";
import { BaseEngine, CalculationResult } from "./baseEngine";

export class ForwardEngine<CalculationData = any> extends BaseEngine<
    CalculationData,
    [startingNode: AbstractNode, nodeUpdateEvent: INodeUpdateEventData | undefined]
> {
    public override runGraph(
        graph: Graph,
        inputs: Map<string, any>,
        calculationData: CalculationData,
    ): Promise<CalculationResult> {
        throw new Error("Not implemented");
    }

    protected override async execute(
        calculationData: CalculationData,
        startingNode: AbstractNode,
        data: INodeUpdateEventData | undefined,
    ): Promise<CalculationResult> {
        const nodesToCalculate: Array<{ node: AbstractNode; inputData: Record<string, any> }> = [];
        const result = new Map<string, Map<string, any>>();

        if (startingNode.calculate) {
            // TODO: Make it possible to give the initial data to the function
            const inputData = this.getDataForNode(startingNode);
            if (data) {
                inputData[data.name] = data.intf.value;
            }
            nodesToCalculate.push({
                node: startingNode,
                inputData,
            });
        }

        while (nodesToCalculate.length > 0) {
            const { node, inputData } = nodesToCalculate.shift()!;

            const r = await node.calculate!(inputData, {
                engine: this,
                globalValues: calculationData,
            });
            this.validateNodeCalculationOutput(node, r);
            result.set(node.id, new Map(Object.entries(r)));

            const graph = node.graph;
            if (!graph) {
                throw new Error(`Can't run engine on node that is not in graph (nodeId: ${node.id})`);
            }

            const nodeOutputInterfaces = Object.values(node.outputs);
            const outgoingConnections = graph.connections.filter((c) => nodeOutputInterfaces.includes(c.from));

            for (const c of outgoingConnections) {
                //TODO: This approach doesn't work when a node has multiple connections to another node
                const nodeId = c.to.nodeId;
                const targetNode = nodeId && graph.findNodeById(nodeId);
                if (!nodeId || !targetNode || !targetNode.calculate) {
                    continue;
                }
                const [inputKey] = Object.entries(targetNode.inputs).find(([, v]) => v.id === c.to.id)!;
                const [outputKey] = Object.entries(node.outputs).find(([, v]) => v.id === c.from.id)!;
                nodesToCalculate.push({
                    node: targetNode,
                    inputData: { ...this.getDataForNode(targetNode), [inputKey]: r[outputKey] },
                });
            }
        }

        return result;
    }

    protected override onChange(
        recalculateOrder: boolean,
        updatedNode?: AbstractNode,
        data?: INodeUpdateEventData,
    ): void {
        this.recalculateOrder = recalculateOrder || this.recalculateOrder;
        if (updatedNode && data) {
            void this.calculateWithoutData(updatedNode, data);
        }
    }

    /** Get the current value of all input interfaces of the given node */
    private getDataForNode(node: AbstractNode): Record<string, any> {
        const values: Record<string, any> = {};
        Object.entries(node.inputs).forEach(([k, v]) => {
            values[k] = v.value;
        });
        return values;
    }
}

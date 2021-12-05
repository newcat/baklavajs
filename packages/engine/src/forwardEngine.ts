import { AbstractNode, INodeUpdateEventData } from "@baklavajs/core";
import { BaseEngine, CalculationResult } from "./baseEngine";

export class ForwardEngine<CalculationData = any> extends BaseEngine<
    CalculationData,
    [AbstractNode, INodeUpdateEventData]
> {
    protected async execute(
        calculationData: CalculationData,
        startingNode: AbstractNode,
        data: INodeUpdateEventData,
    ): Promise<CalculationResult> {
        if (!this.order) {
            throw new Error("runCalculation called without order being calculated before");
        }

        const nodesToCalculate: Array<{ node: AbstractNode; inputData: Record<string, any> }> = [];
        const result = new Map<string, Map<string, any>>();

        if (startingNode.calculate) {
            // TODO: Make it possible to give the initial data to the function
            nodesToCalculate.push({ node: startingNode, inputData: { [data.name]: data.intf.value } });
        }

        while (nodesToCalculate.length > 0) {
            const { node, inputData } = nodesToCalculate.shift()!;

            const r = await node.calculate!(inputData, calculationData);
            this.validateNodeCalculationOutput(node, r);
            result.set(node.id, new Map(Object.entries(r)));

            const connections = this.order.connectionsFromNode.get(node);
            if (!connections) {
                continue;
            }

            for (const c of connections) {
                const nodeId = this.order.interfaceIdToNodeId.get(c.to.id);
                const targetNode = nodeId && this.order.calculationOrder.find((n) => n.id === nodeId);
                if (!nodeId || !targetNode || !targetNode.calculate) {
                    continue;
                }
                const [inputKey] = Object.entries(targetNode.inputs).find(([, v]) => v.id === c.to.id)!;
                const [outputKey] = Object.entries(node.outputs).find(([, v]) => v.id === c.from.id)!;
                nodesToCalculate.push({ node: targetNode, inputData: { [inputKey]: r[outputKey] } });
            }
        }

        return result;
    }

    protected onChange(recalculateOrder: boolean, updatedNode?: AbstractNode, data?: INodeUpdateEventData): void {
        this.recalculateOrder = recalculateOrder || this.recalculateOrder;
        if (updatedNode && data) {
            void this.calculateWithoutData(updatedNode, data);
        }
    }
}

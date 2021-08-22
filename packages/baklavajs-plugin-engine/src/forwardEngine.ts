import { AbstractNode, Editor, INodeUpdateEventData } from "@baklavajs/core";
import { BaseEngine, CalculationResult } from "./baseEngine";
import { calculateOrder, IOrderCalculationResult } from "./nodeTreeBuilder";

export class ForwardEngine<CalculationData = any> extends BaseEngine<
    CalculationData,
    [AbstractNode, INodeUpdateEventData]
> {
    protected runCalculation(
        calculationData: CalculationData,
        node: AbstractNode,
        data: INodeUpdateEventData,
    ): Promise<CalculationResult> {
        if (!this.order) {
            throw new Error("runCalculation called without order being calculated before");
        }

        const { calculationOrder, connectionsFromNode } = this.order!;
    }

    protected onChange(recalculateOrder: boolean, updatedNode?: AbstractNode, data?: INodeUpdateEventData): void {
        this.recalculateOrder = recalculateOrder || this.recalculateOrder;
        if (this.calculateOnChange && updatedNode && data) {
            this.calculateWithoutData(updatedNode, data);
        }
    }

    private calculateNode(node: AbstractNode, inputData: Record<string, any>, calculationData: CalculationData) {
        if (!node.calculate) {
            return;
        }

        const r = node.calculate(inputData, calculationData);
        this.validateNodeCalculationOutput(node, r);

        const connections = this.order!.connectionsFromNode.get(node);
        // TODO:
    }
}

import { Graph } from "./graph";

/**
 * Key: node id
 * Value: calculation result of that node
 *   Calculation result key: output interface key
 *   Calculation result value: calculated value for that interface
 */
export type CalculationResult = Map<string, Map<string, any>>;

export interface IEngine<CalculationData> {
    runGraph(graph: Graph, inputs: Map<string, any>, calculationData: CalculationData): Promise<CalculationResult>;
    getInputValues(graph: Graph): Map<string, any>;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: Reenable ESLint rule after implementation
import { AbstractNode, Connection, Graph, INodeUpdateEventData, Editor } from "@baklavajs/core";
import { BaseEngine, CalculationResult } from "@baklavajs/engine";


enum NodeRuntimeStatus {
    none,
    started,
    stoped,
}

export class AsyncForwardEngine<CalculationData = any> extends BaseEngine<
    CalculationData,
    [startingNode: AbstractNode]
> {
    private order: Map<string, ITopologicalSortingResult> = new Map();
    public constructor(editor: Editor) {
        super(editor);
    }
    public override start() {
        super.start();
        this.recalculateOrder = true;
        void this.calculateWithoutData();
    }

    protected override async execute(
        calculationData: CalculationData,
        startingNode: AbstractNode
    ): Promise<CalculationResult> {
        const result = new Map<string, Map<string, any>>();
        if (!startingNode)
            return result;
        return new Promise((resolve, reject) => {
            if (this.recalculateOrder) {
                this.order.clear();
                this.recalculateOrder = false;
            }
            const graph = this.editor.graph;
            const inputs = this.getInputValues(graph);
            const nodesToCalculate: Map<string, NodeRuntimeStatus> = new Map();
            const interfaceToNode: Map<string, AbstractNode> = new Map();
            //节点前后接口对应节点
            graph.nodes.forEach(node => {
                Object.entries(node.outputs).forEach(([k, v]) => {
                    interfaceToNode.set(v.id, node)
                });
                Object.entries(node.inputs).forEach(([k, v]) => {
                    interfaceToNode.set(v.id, node)
                });
            });
            //当前节点回退的节点
            const getBackNodes = (node: AbstractNode): AbstractNode[] => {
                const backNodes: AbstractNode[] = [];
                Object.entries(node.inputs).forEach(([k, v]) => {
                    let index = graph.connections.findIndex(c => c.to.id === v.id)
                    if (index >= 0) {
                        backNodes.push(interfaceToNode.get(graph.connections[index].from.id))
                    }
                });
                return backNodes;
            }
            //当前节点向前的节点
            const getForwardNodes = (node: AbstractNode): AbstractNode[] => {
                const forwardNodes: AbstractNode[] = [];
                Object.entries(node.outputs).forEach(([k, v]) => {
                    let index = graph.connections.findIndex(c => c.from.id === v.id)
                    if (index >= 0) {
                        forwardNodes.push(interfaceToNode.get(graph.connections[index].to.id))
                    }
                });
                return forwardNodes;
            }
            //与当前节点相邻的节点（前，后）
            const getConnectionNodes = (node: AbstractNode): AbstractNode[] => {
                const backNodes: AbstractNode[] = getBackNodes(node);
                const forwardNodes: AbstractNode[] = getForwardNodes(node);
                return backNodes.concat(forwardNodes)
            }
            //与之关联的节点网络
            const getLeafNodes = (node: AbstractNode) => {
                if (!nodesToCalculate.has(node.id)) {
                    nodesToCalculate.set(node.id, NodeRuntimeStatus.none);
                    getConnectionNodes(node).forEach(getLeafNodes)
                }
            }
            //计算指定节点
            const runDeepLeaf = async (n: AbstractNode) => {
                if (nodesToCalculate.has(n.id) && nodesToCalculate.get(n.id) === NodeRuntimeStatus.none) {
                    const backNodes: AbstractNode[] = getBackNodes(n);
                    const backCalc: AbstractNode[] = backNodes.filter(n => nodesToCalculate.has(n.id) && nodesToCalculate.get(n.id) === NodeRuntimeStatus.none)
                    if (backCalc.length) {
                        //回退至未计算节点
                        backCalc.forEach(runDeepLeaf)
                    }
                    else {
                        try {
                            nodesToCalculate.set(n.id, NodeRuntimeStatus.started);
                            const inputsForNode: Record<string, any> = {};
                            Object.entries(n.inputs).forEach(([k, v]) => {
                                inputsForNode[k] = this.getInterfaceValue(inputs, v.id);
                            });
                            /*
                            if(this.internalStatus == NodeRuntimeStatus.stoped)
                            {
                                reject("stoped")
                                return;
                            }
                            */
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
                            Object.entries(n.outputs).forEach(([intfKey, intf]) => {
                                graph.connections.filter(c => c.from.id == intf.id).forEach(c => {
                                    if (c) {
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
                                    }
                                })
                            })
                            nodesToCalculate.set(n.id, NodeRuntimeStatus.stoped);
                            const forwardNodes: AbstractNode[] = getForwardNodes(n);
                            const forwardCalc: AbstractNode[] = forwardNodes.filter(n => nodesToCalculate.has(n.id))
                            //从当前节点继续
                            forwardCalc.forEach(runDeepLeaf)
                        }
                        finally {
                            nodesToCalculate.set(n.id, NodeRuntimeStatus.stoped);
                            if (nodesToCalculate.values().every(v => v === NodeRuntimeStatus.stoped)) {
                                resolve(result)
                            }
                        }
                    }
                }
            }
            getLeafNodes(startingNode);
            runDeepLeaf(startingNode)
        })
    }
    private getInterfaceValue(values: Map<string, any>, id: string): any {
        if (!values.has(id)) {
            console.log(this.editor.graph, values)
            throw new Error(
                `Could not find value for interface ${id}\n` +
                "This is likely a Baklava internal issue. Please report it on GitHub.",
            );
        }
        return values.get(id);
    }
    public getInputValues(graph: Graph): Map<string, any> {
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
}

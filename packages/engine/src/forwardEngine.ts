import {
    AbstractNode,
    Graph,
    NodeInterface,
    IConnection,
    INodeUpdateEventData,
    DummyConnection,
    CalculationResult,
} from "@baklavajs/core";
import { BaseEngine } from "./baseEngine";
import { isExecutionFlow, isExecutionConnection } from "./executionFlow";
import { sortTopologically, containsCycle, ITopologicalSortingResult } from "./topologicalSorting";

export interface ForwardCalculationContext<G = any> {
    globalValues: G;
    engine: ForwardEngine<G>;
    /**
     * Programmatically execute the downstream chain connected to an execution-flow output.
     * This can be called multiple times (e.g. in a loop) and is awaitable.
     * @param outputKey The key of the execution-flow output to fire
     * @param outputValues Optional values for the current node's outputs, visible to
     *   downstream nodes that pull data from this node during this chain execution.
     * @returns The calculation results of all nodes executed in the chain
     */
    executeOutput: (outputKey: string, outputValues?: Record<string, any>) => Promise<CalculationResult>;
}

export class ForwardEngine<CalculationData = any> extends BaseEngine<
    CalculationData,
    [startingNode: AbstractNode, nodeUpdateEvent: INodeUpdateEventData | undefined]
> {
    private order: Map<string, ITopologicalSortingResult> = new Map();

    protected override async execute(
        calculationData: CalculationData,
        startingNode: AbstractNode,
        data: INodeUpdateEventData | undefined,
    ): Promise<CalculationResult> {
        const graph = startingNode.graph;
        if (!graph) {
            throw new Error(`Can't run engine on node that is not in a graph (nodeId: ${startingNode.id})`);
        }

        const result: CalculationResult = new Map();

        // If triggered by a value change, pass the changed value as an input override.
        const initialOverrides: Record<string, any> | undefined = data ? { [data.name]: data.intf.value } : undefined;

        await this.executeChain(startingNode, graph, calculationData, result, new Map(), initialOverrides);

        return result;
    }

    /**
     * Execute a forward chain starting from the given node.
     * Follows execution-flow connections, resolves data inputs on demand.
     * @param startNode The node to start execution from
     * @param graph The graph containing the nodes
     * @param calculationData Global calculation data
     * @param result Accumulator for calculation results (mutated in place)
     * @param outputOverrides Map of nodeId -> output values to use when pulling data from that node
     * @param inputOverrides Optional input value overrides for the start node
     */
    private async executeChain(
        startNode: AbstractNode,
        graph: Graph,
        calculationData: CalculationData,
        result: CalculationResult,
        outputOverrides: Map<string, Record<string, any>>,
        inputOverrides?: Record<string, any>,
    ): Promise<void> {
        const queue: Array<{ node: AbstractNode; inputOverrides?: Record<string, any> }> = [];
        queue.push({ node: startNode, inputOverrides });

        while (queue.length > 0) {
            const entry = queue.shift()!;
            const node = entry.node;

            // Gather data inputs for this node
            const inputValues = await this.gatherInputValues(node, graph, calculationData, outputOverrides, result);
            if (entry.inputOverrides) {
                Object.assign(inputValues, entry.inputOverrides);
            }

            this.events.beforeNodeCalculation.emit({ inputValues, node });

            // Track which exec outputs were fired imperatively via executeOutput
            const manuallyExecutedOutputs = new Set<string>();

            // Build the executeOutput function for this node
            const executeOutput = async (
                outputKey: string,
                outputValues?: Record<string, any>,
            ): Promise<CalculationResult> => {
                const outputIntf = node.outputs[outputKey];
                if (!outputIntf) {
                    throw new Error(`Output "${outputKey}" does not exist on node ${node.id} (type ${node.type})`);
                }
                if (!isExecutionFlow(outputIntf)) {
                    throw new Error(
                        `Output "${outputKey}" on node ${node.id} (type ${node.type}) is not an execution-flow output`,
                    );
                }

                manuallyExecutedOutputs.add(outputKey);

                // Create a new overrides map that includes the provided output values for this node
                const chainOverrides = new Map(outputOverrides);
                if (outputValues) {
                    chainOverrides.set(node.id, { ...chainOverrides.get(node.id), ...outputValues });
                }

                const chainResult: CalculationResult = new Map();
                const execConnections = graph.connections.filter((c) => c.from.id === outputIntf.id);

                for (const conn of execConnections) {
                    const targetNodeId = conn.to.nodeId;
                    const targetNode = targetNodeId ? graph.findNodeById(targetNodeId) : undefined;
                    if (targetNode) {
                        await this.executeChain(targetNode, graph, calculationData, chainResult, chainOverrides);
                    }
                }

                // Merge chain results into the main result
                for (const [k, v] of chainResult) {
                    result.set(k, v);
                }

                return chainResult;
            };

            let r: Record<string, any>;
            if (node.calculate) {
                r = await node.calculate(inputValues, {
                    engine: this,
                    globalValues: calculationData,
                    executeOutput,
                } as ForwardCalculationContext<CalculationData>);
            } else {
                // Passthrough: use input values or interface defaults for outputs
                r = {};
                for (const [k, intf] of Object.entries(node.outputs)) {
                    r[k] = intf.value;
                }
            }

            this.validateNodeCalculationOutput(node, r);
            this.events.afterNodeCalculation.emit({ outputValues: r, node });
            result.set(node.id, new Map(Object.entries(r)));

            // Follow execution-flow outputs to enqueue downstream nodes,
            // but skip outputs that were already fired via executeOutput
            for (const [outputKey, outputIntf] of Object.entries(node.outputs)) {
                if (!isExecutionFlow(outputIntf)) {
                    continue;
                }

                if (manuallyExecutedOutputs.has(outputKey)) {
                    continue;
                }

                // Branching: skip if the exec output value is falsy
                if (!r[outputKey]) {
                    continue;
                }

                const execConnections = graph.connections.filter((c) => c.from.id === outputIntf.id);
                for (const conn of execConnections) {
                    const targetNodeId = conn.to.nodeId;
                    const targetNode = targetNodeId ? graph.findNodeById(targetNodeId) : undefined;
                    if (targetNode) {
                        queue.push({ node: targetNode });
                    }
                }
            }
        }
    }

    /**
     * Gather input values for a node that is about to be executed.
     * - Execution-flow inputs are skipped (they don't carry data).
     * - Connected data inputs: pull the value from the source node (stateless re-evaluation).
     * - Unconnected data inputs: use the interface's current value.
     * @param outputOverrides When a source node has entries here, use those values
     *   instead of calculating the node. This is how executeOutput provides per-iteration data.
     * @param resultCache Results from nodes already calculated in the current chain.
     *   If a source node is in the cache, its cached output is used instead of recalculating.
     */
    /**
     * Resolve the value transferred by a single connection, checking overrides and cache before
     * falling back to a stateless re-evaluation of the source node.
     * Returns `undefined` if the source cannot be resolved.
     */
    private async resolveConnectionValue(
        conn: IConnection,
        graph: Graph,
        calculationData: CalculationData,
        outputOverrides: Map<string, Record<string, any>>,
        resultCache?: CalculationResult,
    ): Promise<any> {
        const sourceNodeId = conn.from.nodeId;
        const sourceNode = sourceNodeId ? graph.findNodeById(sourceNodeId) : undefined;
        if (!sourceNode) {
            return undefined;
        }

        const sourceKey = Object.entries(sourceNode.outputs).find(([, v]) => v.id === conn.from.id)?.[0];
        if (!sourceKey) {
            return undefined;
        }

        // 1. Check output overrides (from executeOutput or subgraph input injection)
        const overrides = outputOverrides.get(sourceNode.id);
        if (overrides && sourceKey in overrides) {
            return this.hooks.transferData.execute(overrides[sourceKey], conn);
        }

        // 2. Check result cache (node already calculated in this chain)
        if (resultCache && resultCache.has(sourceNode.id)) {
            const cachedOutputs = resultCache.get(sourceNode.id)!;
            if (cachedOutputs.has(sourceKey)) {
                return this.hooks.transferData.execute(cachedOutputs.get(sourceKey), conn);
            }
        }

        // 3. Stateless pull: recursively resolve data node
        const sourceOutputs = await this.resolveNodeData(sourceNode, graph, calculationData, outputOverrides);
        if (sourceKey in sourceOutputs) {
            return this.hooks.transferData.execute(sourceOutputs[sourceKey], conn);
        }

        return undefined;
    }

    private async gatherInputValues(
        node: AbstractNode,
        graph: Graph,
        calculationData: CalculationData,
        outputOverrides: Map<string, Record<string, any>>,
        resultCache?: CalculationResult,
    ): Promise<Record<string, any>> {
        const values: Record<string, any> = {};

        for (const [key, intf] of Object.entries(node.inputs)) {
            if (isExecutionFlow(intf)) {
                continue;
            }

            const incomingConnections = graph.connections.filter((c) => c.to.id === intf.id);
            if (incomingConnections.length === 0) {
                values[key] = intf.value;
                continue;
            }

            if (intf.allowMultipleConnections) {
                // Collect values from all incoming connections into an array
                const multiValues: any[] = [];
                for (const conn of incomingConnections) {
                    const v = await this.resolveConnectionValue(conn, graph, calculationData, outputOverrides, resultCache);
                    multiValues.push(v ?? intf.value);
                }
                values[key] = multiValues;
                continue;
            }

            // Single connection — resolve and assign directly
            const resolved = await this.resolveConnectionValue(
                incomingConnections[0],
                graph,
                calculationData,
                outputOverrides,
                resultCache,
            );
            values[key] = resolved ?? intf.value;
        }

        return values;
    }

    /**
     * Recursively resolve a data-only node's outputs by pulling its connected inputs.
     * Stateless — re-evaluated every time (like Unreal's pure functions).
     */
    private async resolveNodeData(
        node: AbstractNode,
        graph: Graph,
        calculationData: CalculationData,
        outputOverrides: Map<string, Record<string, any>>,
    ): Promise<Record<string, any>> {
        // Gather inputs for this data node
        const inputValues = await this.gatherInputValues(node, graph, calculationData, outputOverrides);

        if (node.calculate) {
            return await node.calculate(inputValues, {
                engine: this,
                globalValues: calculationData,
            });
        }

        // No calculate function — passthrough output interface values
        const outputs: Record<string, any> = {};
        for (const [k, intf] of Object.entries(node.outputs)) {
            outputs[k] = intf.value;
        }
        return outputs;
    }

    public override async runGraph(
        graph: Graph,
        inputs: Map<string, any>,
        calculationData: CalculationData,
    ): Promise<CalculationResult> {
        // Build output overrides for nodes without calculate (e.g. SubgraphInputNodes).
        // Their output values come from the inputs map, not from calculation.
        const outputOverrides = new Map<string, Record<string, any>>();
        const execEntryNodes: AbstractNode[] = [];

        for (const node of graph.nodes) {
            if (node.calculate) {
                continue;
            }

            const outputs: Record<string, any> = {};
            for (const [k, intf] of Object.entries(node.outputs)) {
                if (inputs.has(intf.id)) {
                    const value = inputs.get(intf.id);
                    outputs[k] = value;

                    // Check if this output connects to an exec-flow input → exec entry point
                    if (value) {
                        const connections = graph.connections.filter((c) => c.from.id === intf.id);
                        for (const conn of connections) {
                            if (isExecutionFlow(conn.to)) {
                                const targetNode = conn.to.nodeId ? graph.findNodeById(conn.to.nodeId) : undefined;
                                if (targetNode) {
                                    execEntryNodes.push(targetNode);
                                }
                            }
                        }
                    }
                }
            }

            if (Object.keys(outputs).length > 0) {
                outputOverrides.set(node.id, outputs);
            }
        }

        if (execEntryNodes.length > 0) {
            // Forward execution within the subgraph
            const result: CalculationResult = new Map();

            for (const entryNode of execEntryNodes) {
                await this.executeChain(entryNode, graph, calculationData, result, outputOverrides);
            }

            return result;
        }

        // No exec-flow entry points: fall back to topological-sort-based execution
        // (for pure-data subgraphs, same approach as DependencyEngine)
        return this.runGraphTopological(graph, inputs, calculationData);
    }

    /**
     * Run a subgraph using topological sorting (for pure-data subgraphs without exec-flow).
     */
    private async runGraphTopological(
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
                if (!inputs.has(v.id)) {
                    throw new Error(
                        `Could not find value for interface ${v.id}\n` +
                            "This is likely a Baklava internal issue. Please report it on GitHub.",
                    );
                }
                inputsForNode[k] = inputs.get(v.id);
            });

            this.events.beforeNodeCalculation.emit({ inputValues: inputsForNode, node: n });

            let r: any;
            if (n.calculate) {
                r = await n.calculate(inputsForNode, { globalValues: calculationData, engine: this });
            } else {
                r = {};
                for (const [k, intf] of Object.entries(n.outputs)) {
                    if (!inputs.has(intf.id)) {
                        throw new Error(
                            `Could not find value for interface ${intf.id}\n` +
                                "This is likely a Baklava internal issue. Please report it on GitHub.",
                        );
                    }
                    r[k] = inputs.get(intf.id);
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

    public getInputValues(graph: Graph): Map<string, any> {
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

    public override checkConnection(from: NodeInterface, to: NodeInterface) {
        const fromIsExec = isExecutionFlow(from);
        const toIsExec = isExecutionFlow(to);

        // Reject mixed connections (exec → data or data → exec)
        if (fromIsExec !== toIsExec) {
            return { connectionAllowed: false, connectionsInDanger: [] };
        }

        // Pure execution-flow connections are allowed to form cycles (needed for loops)
        if (fromIsExec && toIsExec) {
            return {
                connectionAllowed: true,
                connectionsInDanger: to.allowMultipleConnections
                    ? []
                    : this.editor.graph.connections.filter((c) => c.to === to),
            };
        }

        // For data connections, check for cycles excluding execution-flow connections
        if (from.templateId) {
            const newFrom = this.findInterfaceByTemplateId(this.editor.graph.nodes, from.templateId);
            if (newFrom) {
                from = newFrom;
            }
        }
        if (to.templateId) {
            const newTo = this.findInterfaceByTemplateId(this.editor.graph.nodes, to.templateId);
            if (newTo) {
                to = newTo;
            }
        }

        const dc = new DummyConnection(from, to);
        let connections: IConnection[] = this.editor.graph.connections.slice();
        if (!to.allowMultipleConnections) {
            connections = connections.filter((conn) => conn.to !== to);
        }
        connections.push(dc);

        // Filter to data-only connections for cycle detection
        const dataConnections = connections.filter((c) => !isExecutionConnection(c));
        if (containsCycle(this.editor.graph.nodes, dataConnections)) {
            return { connectionAllowed: false, connectionsInDanger: [] };
        }

        return {
            connectionAllowed: true,
            connectionsInDanger: to.allowMultipleConnections
                ? []
                : this.editor.graph.connections.filter((c) => c.to === to),
        };
    }

    protected override onChange(
        recalculateOrder: boolean,
        updatedNode?: AbstractNode,
        data?: INodeUpdateEventData,
    ): void {
        if (recalculateOrder) {
            this.recalculateOrder = true;
            this.order.clear();
        }
        if (updatedNode && data) {
            void this.calculateWithoutData(updatedNode, data);
        }
    }
}

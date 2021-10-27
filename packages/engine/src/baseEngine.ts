import { BaklavaEvent, DynamicSequentialHook, PreventableBaklavaEvent, SequentialHook } from "@baklavajs/events";
import {
    AbstractNode,
    NodeInterface,
    IConnection,
    Editor,
    GRAPH_NODE_TYPE_PREFIX,
    INodeUpdateEventData,
} from "@baklavajs/core";
import { sortTopologically, containsCycle, expandGraph, ITopologicalSortingResult } from "./topologicalSorting";

/**
 * Key: node id
 * Value: calculation result of that node
 *   Calculation result key: output interface key
 *   Calculation result value: calculated value for that interface
 */
export type CalculationResult = Map<string, Map<string, any>>;

export abstract class BaseEngine<CalculationData, CalculationArgs extends Array<any>> {
    public events = {
        /** This event will be called before all the nodes `calculate` functions are called.
         * The argument is the calculationData that the nodes will receive
         */
        beforeCalculate: new PreventableBaklavaEvent<CalculationData, BaseEngine<CalculationData, CalculationArgs>>(
            this,
        ),
        calculated: new BaklavaEvent<CalculationResult, BaseEngine<CalculationData, CalculationArgs>>(this),
    };

    public hooks = {
        gatherCalculationData: new SequentialHook<
            CalculationData | undefined,
            BaseEngine<CalculationData, CalculationArgs>,
            CalculationData
        >(this),
        transferData: new DynamicSequentialHook<any, IConnection>(),
    };

    /** This should be set to "true" while updating the graph with the calculation results */
    public disableCalculateOnChange = false;

    protected order?: ITopologicalSortingResult;
    protected recalculateOrder = false;

    /**
     * Construct a new Engine plugin
     * @param calculateOnChange Whether to automatically calculate all nodes when any node interface is changed.
     */
    public constructor(protected editor: Editor, protected calculateOnChange = false) {
        this.editor.nodeEvents.update.subscribe(this, (data, node) => {
            if (node.type.startsWith(GRAPH_NODE_TYPE_PREFIX) && data === null) {
                this.internalOnChange(true);
            } else {
                this.internalOnChange(false, node, data!);
            }
        });

        this.editor.graphEvents.addNode.subscribe(this, () => {
            this.internalOnChange(true);
        });

        this.editor.graphEvents.removeNode.subscribe(this, () => {
            this.internalOnChange(true);
        });

        this.editor.graphEvents.checkConnection.subscribe(this, (c) => {
            if (!this.checkConnection(c.from, c.to)) {
                return false;
            }
        });

        this.editor.graphEvents.addConnection.subscribe(this, () => {
            this.internalOnChange(true);
        });

        this.editor.graphEvents.removeConnection.subscribe(this, () => {
            this.internalOnChange(true);
        });
    }

    /**
     * Calculate all nodes.
     * This will automatically calculate the node calculation order if necessary and
     * transfer values between connected node interfaces.
     * @param calculationData The data which is provided to each node's `calculate` method
     * @param calculationArgs Additional data which is only provided to the engine
     * @returns A promise that resolves to either
     * - a map that maps rootNodes to their calculated value (what the calculation function of the node returned)
     * - null if the calculation was prevented from the beforeCalculate event
     */
    public async calculate(
        calculationData: CalculationData,
        ...args: CalculationArgs
    ): Promise<CalculationResult | null> {
        if (this.events.beforeCalculate.emit(calculationData)) {
            return null;
        }

        if (this.recalculateOrder) {
            this.calculateOrder();
        }

        const result = await this.runCalculation(calculationData, ...args);
        this.events.calculated.emit(result);
        return result;
    }

    /** Check whether a connection can be created.
     * A connection can not be created when it would result in a cyclic graph.
     * @param from The interface from which the connection would start
     * @param to The interface where the connection would end
     * @returns Whether the connection can be created
     */
    public checkConnection(from: NodeInterface, to: NodeInterface): boolean {
        const { nodes, connections } = expandGraph(this.editor.graph);

        if (from.templateId) {
            const newFrom = this.findInterfaceByTemplateId(nodes, from.templateId);
            if (!newFrom) {
                return true;
            }
            from = newFrom;
        }

        if (to.templateId) {
            const newTo = this.findInterfaceByTemplateId(nodes, to.templateId);
            if (!newTo) {
                return true;
            }
            to = newTo;
        }

        const dc = { from, to, id: "dc", destructed: false, isInDanger: false } as IConnection;

        const copy = connections.concat([dc]);
        // TODO: Only filter if to doesn't allow multiple connections
        copy.filter((conn) => conn.to !== to);
        return containsCycle(nodes, copy);
    }

    /**
     * Force the engine to recalculate the node execution order.
     * This is normally done automatically. Use this method if the
     * default change detection does not work in your scenario.
     */
    public calculateOrder(): void {
        this.order = sortTopologically(this.editor.graph.nodes, this.editor.graph.connections);
        this.recalculateOrder = false;
    }

    /**
     * Use the `gatherCalculationData` hook to get the calculation data
     * @param args The calculation arguments with which the engine's calculate method will be called (in addition to the `calculationData`)
     * @returns The calculation result
     */
    protected async calculateWithoutData(...args: CalculationArgs): Promise<CalculationResult | null> {
        const calculationData = this.hooks.gatherCalculationData.execute(undefined);
        return await this.calculate(calculationData, ...args);
    }

    /**
     * Validate the result of a node's `calculate` method. A result is valid if:
     * - is has the correct format (it must be an object, where the key is the interface key and the value is the output value for that interface)
     * - every output interface has a value assigned to it (null and undefined are also valid, but the key must exist in the object)
     * @param node The node which produced the output data
     * @param output The result of the node's `calculate` method
     */
    protected validateNodeCalculationOutput(node: AbstractNode, output: any): void {
        if (typeof output !== "object") {
            throw new Error(`Invalid calculation return value from node ${node.id} (type ${node.type})`);
        }
        Object.keys(node.outputs).forEach((k) => {
            if (!(k in output)) {
                throw new Error(
                    `Calculation return value from node ${node.id} (type ${node.type}) is missing key "${k}"`,
                );
            }
        });
    }

    /**
     * Overwrite this method to perform the calculation
     * @param calculationData The data which is provided to each node's `calculate` method
     * @param calculationArgs Additional data which is only provided to the engine
     * @returns The calculation result
     */
    protected abstract runCalculation(
        calculationData: CalculationData,
        ...calculationArgs: CalculationArgs
    ): Promise<CalculationResult>;

    /**
     * This method is called whenever the graph or values of node interfaces have been changed.
     * You can overwrite this method to automatically trigger a calculation on change.
     * Note: This method is NOT called when the `disableCalculateOnChange` flag is set
     * @param recalculateOrder Whether the change modified the graph itself, e. g. a connection or a node was added/removed
     * @param updatedNode If a node was updated (which means the value a node's interface has been changed): the node that was updated; `undefined` otherwise
     * @param data If a node was updated: The `update` event payload to determine, which interface exactly has been changed; `undefined` otherwise
     */
    protected abstract onChange(
        recalculateOrder: boolean,
        updatedNode?: AbstractNode,
        data?: INodeUpdateEventData,
    ): void;

    private internalOnChange(recalculateOrder: boolean, updatedNode?: AbstractNode, data?: INodeUpdateEventData) {
        if (!this.disableCalculateOnChange) {
            this.onChange(recalculateOrder, updatedNode, data);
        }
    }

    private findInterfaceByTemplateId(nodes: ReadonlyArray<AbstractNode>, templateId: string): NodeInterface | null {
        for (const n of nodes) {
            for (const intf of [...Object.values(n.inputs), ...Object.values(n.outputs)]) {
                if (intf.templateId === templateId) {
                    return intf;
                }
            }
        }
        return null;
    }
}

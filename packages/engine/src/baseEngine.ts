import { BaklavaEvent, DynamicSequentialHook, PreventableBaklavaEvent, SequentialHook } from "@baklavajs/events";
import {
    AbstractNode,
    NodeInterface,
    IConnection,
    Editor,
    GRAPH_NODE_TYPE_PREFIX,
    INodeUpdateEventData,
} from "@baklavajs/core";
import { calculateOrder, containsCycle, expandGraph, IOrderCalculationResult } from "./nodeTreeBuilder";

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

    protected order?: IOrderCalculationResult;
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
        this.order = calculateOrder(this.editor.graph.nodes, this.editor.graph.connections);
        this.recalculateOrder = false;
    }

    protected async calculateWithoutData(...args: CalculationArgs): Promise<CalculationResult | null> {
        const calculationData = this.hooks.gatherCalculationData.execute(undefined);
        return await this.calculate(calculationData, ...args);
    }

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

    protected abstract runCalculation(
        calculationData: CalculationData,
        ...calculationArgs: CalculationArgs
    ): Promise<CalculationResult>;

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

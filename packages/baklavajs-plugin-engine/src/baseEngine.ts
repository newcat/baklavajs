import { BaklavaEvent, PreventableBaklavaEvent, SequentialHook } from "@baklavajs/events";
import { AbstractNode, NodeInterface, IConnection, Editor, GRAPH_NODE_TYPE_PREFIX } from "@baklavajs/core";
import { containsCycle, expandGraph } from "./nodeTreeBuilder";

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
    };

    /**
     * Construct a new Engine plugin
     * @param calculateOnChange Whether to automatically calculate all nodes when any node interface is changed.
     */
    public constructor(protected editor: Editor, private calculateOnChange = false) {
        this.editor.graphEvents.checkConnection.subscribe(this, (c) => {
            if (!this.checkConnection(c.from, c.to)) {
                return false;
            }
        });

        this.editor.nodeEvents.update.subscribe(this, (data, node) => {
            if (node.type.startsWith(GRAPH_NODE_TYPE_PREFIX) && data === null) {
                this.onChange(true);
            } else {
                this.onChange(false, node);
            }
        });

        this.editor.graphEvents.addNode.subscribe(this, () => {
            this.onChange(true);
        });

        this.editor.graphEvents.removeNode.subscribe(this, () => {
            this.onChange(true);
        });

        this.editor.graphEvents.checkConnection.subscribe(this, (c) => {
            if (!this.checkConnection(c.from, c.to)) {
                return false;
            }
        });

        this.editor.graphEvents.addConnection.subscribe(this, () => {
            this.onChange(true);
        });

        this.editor.graphEvents.removeConnection.subscribe(this, () => {
            this.onChange(true);
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
        copy.filter((conn) => conn.to !== to);
        return containsCycle(nodes, copy);
    }

    protected async calculateWithoutData(...args: CalculationArgs): Promise<CalculationResult | null> {
        const calculationData = this.hooks.gatherCalculationData.execute(undefined);
        return await this.calculate(calculationData, ...args);
    }

    protected abstract runCalculation(
        calculationData: CalculationData,
        ...calculationArgs: CalculationArgs
    ): Promise<CalculationResult>;
    protected abstract onChange(recalculateOrder: boolean, updatedNode?: AbstractNode): void;

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

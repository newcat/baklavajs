import { BaklavaEvent, PreventableBaklavaEvent, SequentialHook } from "@baklavajs/events";
import type { Editor, IPlugin, Connection, AbstractNode, NodeInterface, IConnection } from "@baklavajs/core";
import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
import { calculateOrder, containsCycle } from "./nodeTreeBuilder";

export class Engine implements IPlugin {
    public type = "EnginePlugin";

    public get rootNodes(): AbstractNode[] | undefined {
        return this._rootNodes;
    }

    public set rootNodes(value: AbstractNode[] | undefined) {
        this._rootNodes = value;
        this.recalculateOrder = true;
    }

    public events = {
        /** This event will be called before all the nodes `calculate` functions are called.
         * The argument is the calculationData that the nodes will receive
         */
        beforeCalculate: new PreventableBaklavaEvent<any>(),
        calculated: new BaklavaEvent<Map<AbstractNode, any>>(),
    };

    public hooks = {
        gatherCalculationData: new SequentialHook<any>(),
    };

    private editor!: Editor;
    private nodeCalculationOrder: AbstractNode[] = [];
    private actualRootNodes: AbstractNode[] = [];
    private connectionsPerNode = new Map<AbstractNode, Connection[]>();
    private recalculateOrder = false;
    private calculateOnChange = false;
    private calculationInProgress = false;
    private _rootNodes: AbstractNode[] | undefined = undefined;
    private interfaceTypePlugins: InterfaceTypePlugin[] = [];

    /**
     * Construct a new Engine plugin
     * @param calculateOnChange Whether to automatically calculate all nodes when any node interface is changed.
     */
    public constructor(calculateOnChange = false) {
        this.calculateOnChange = calculateOnChange;
    }

    public register(editor: Editor): void {
        this.editor = editor;

        /*this.editor.events.addNode.addListener(this, (node) => {
            node.events.update.addListener(this, (ev) => {
                if (ev.interface && ev.interface.connectionCount === 0) {
                    this.onChange(false);
                } else if (ev.option) {
                    this.onChange(false);
                }
            });
            this.onChange(true);
        });

        this.editor.events.removeNode.addListener(this, (node) => {
            node.events.update.removeListener(this);
        });*/

        this.editor.events.checkConnection.addListener(this, (c) => {
            if (!this.checkConnection(c.from as NodeInterface, c.to as NodeInterface)) {
                return false;
            }
        });

        this.editor.events.addConnection.addListener(this, (c) => {
            // as only one connection to an input interface is allowed
            // Delete all other connections to the target interface
            this.editor.connections
                .filter((conn) => conn !== c && conn.to === c.to)
                .forEach((conn) => this.editor.removeConnection(conn));

            this.onChange(true);
        });

        this.editor.events.removeConnection.addListener(this, () => {
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
    public async calculate(calculationData?: any): Promise<Map<AbstractNode, any> | null> {
        if (this.events.beforeCalculate.emit(calculationData)) {
            return null;
        }
        calculationData = this.hooks.gatherCalculationData.execute(calculationData);

        this.calculationInProgress = true;
        if (this.recalculateOrder) {
            this.calculateOrder();
        }
        const results: Map<AbstractNode, any> = new Map();
        for (const n of this.nodeCalculationOrder) {
            const r = await n.calculate!(calculationData);
            if (this.actualRootNodes.includes(n)) {
                results.set(n, r);
            }
            if (this.connectionsPerNode.has(n)) {
                this.connectionsPerNode.get(n)!.forEach((c) => {
                    const conversion = this.interfaceTypePlugins.find((p) =>
                        p.canConvert((c.from as any).type, (c.to as any).type)
                    );
                    if (conversion) {
                        c.to.value = conversion.convert((c.from as any).type, (c.to as any).type, c.from.value);
                    } else {
                        c.to.value = c.from.value;
                    }
                });
            }
        }
        this.calculationInProgress = false;
        this.events.calculated.emit(results);
        return results;
    }

    /**
     * Force the engine to recalculate the node execution order.
     * This is normally done automatically. Use this method if the
     * default change detection does not work in your scenario.
     */
    public calculateOrder() {
        this.calculateNodeTree();
        this.recalculateOrder = false;
    }

    private checkConnection(from: NodeInterface, to: NodeInterface) {
        const dc = { from, to, id: "dc", destructed: false, isInDanger: false } as IConnection;
        const copy = (this.editor.connections as ReadonlyArray<IConnection>).concat([dc]);
        copy.filter((conn) => conn.to !== to);
        return containsCycle(this.editor.nodes, copy);
    }

    private onChange(recalculateOrder: boolean) {
        this.recalculateOrder = this.recalculateOrder || recalculateOrder;
        if (this.calculateOnChange && !this.calculationInProgress) {
            this.calculate();
        }
    }

    private calculateNodeTree() {
        const { calculationOrder, rootNodes } = calculateOrder(
            this.editor.nodes,
            this.editor.connections,
            this.rootNodes
        );
        this.nodeCalculationOrder = calculationOrder;
        this.actualRootNodes = rootNodes;
        this.connectionsPerNode.clear();
        this.editor.nodes.forEach((n) => {
            this.connectionsPerNode.set(
                n,
                this.editor.connections.filter((c) => c.from.parent === n)
            );
        });
    }
}

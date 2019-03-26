import { Editor, Node, IPlugin, BaklavaEvent, PreventableBaklavaEvent, IAddConnectionEventData,
    NodeInterface, DummyConnection, IConnection } from "../core";
import { calculateOrder, containsCycle } from "./nodeTreeBuilder";

export class Engine implements IPlugin {

    private editor!: Editor;
    private nodeCalculationOrder: Node[] = [];
    private connectionsPerNode = new Map<Node, IConnection[]>();
    private recalculateOrder = false;
    private calculateOnChange = false;
    private calculationInProgress = false;

    public constructor(calculateOnChange = false) {
        this.calculateOnChange = calculateOnChange;
    }

    public register(editor: Editor) {
        this.editor = editor;

        this.editor.events.addNode.addListener(this, (node) => {
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
        });

        this.editor.events.checkConnection.addListener(this, (c) => {
            if (!this.checkConnection(c.from, c.to)) { return false; }
        });

        this.editor.events.addConnection.addListener(this, (c) => { this.onChange(true); });
        this.editor.events.removeConnection.addListener(this, () => { this.onChange(true); });

    }

    /** Calculate all nodes */
    public async calculate() {
        this.calculationInProgress = true;
        if (this.recalculateOrder) {
            this.calculateNodeTree();
            this.recalculateOrder = false;
        }
        for (const n of this.nodeCalculationOrder) {
            await n.calculate();
            if (this.connectionsPerNode.has(n)) {
                this.connectionsPerNode.get(n)!.forEach((c) => { c.to.value = c.from.value; });
            }
        }
        this.calculationInProgress = false;
    }

    private checkConnection(from: NodeInterface, to: NodeInterface) {
        const dc = new DummyConnection(from, to);
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
        this.nodeCalculationOrder = calculateOrder(this.editor.nodes, this.editor.connections);
        this.connectionsPerNode.clear();
        this.editor.nodes.forEach((n) => {
            this.connectionsPerNode.set(n, this.editor.connections.filter((c) => c.from.parent === n));
        });
    }

}

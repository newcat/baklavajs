import { Editor, Node, IPlugin, BaklavaEvent, INodeEventData, PreventableBaklavaEvent, IConnectionEventData, IAddConnectionEventData, NodeInterface, DummyConnection, IConnection } from "../core";
import { calculateOrder, containsCycle } from "./nodeTreeBuilder";

export class Engine implements IPlugin {

    private editor!: Editor;
    private nodeCalculationOrder: Node[] = [];
    private unsubscribeHandlers = new Map<any, (() => void)>();
    private recalculateOrder = false;
    private calculateOnChange = false;

    public constructor(calculateOnChange = false) {
        this.calculateOnChange = calculateOnChange;
    }

    public register(editor: Editor) {
        this.editor = editor;
        this.editor.addListener<any>("*", (ev) => this.handleEditorEvent(ev));
    }

    /** Calculate all nodes */
    public async calculate() {
        if (this.recalculateOrder) {
            this.calculateNodeTree();
            this.recalculateOrder = false;
        }
        for (const n of this.nodeCalculationOrder) {
            await n.calculate();
        }
    }

    private handleEditorEvent(ev: BaklavaEvent<any>) {
        switch (ev.eventType) {
            case "addNode":
                const addNode = (ev.data as INodeEventData).node;
                this.unsubscribeHandlers.set(addNode, addNode.addListener("*", (x) => this.handleNodeEvent(addNode, x)));
                this.onChange(true);
                break;
            case "removeNode":
                const rmNode = (ev.data as INodeEventData).node;
                if (this.unsubscribeHandlers.has(rmNode)) {
                    this.unsubscribeHandlers.get(rmNode)!();
                }
                this.onChange(true);
                break;
            case "checkConnection":
                // Prevent connections from being added if that would lead to
                // a cycle in the graph
                const ccEvent = ev as PreventableBaklavaEvent<IAddConnectionEventData>;
                if (!this.checkConnection(ccEvent.data.from, ccEvent.data.to)) {
                    ccEvent.preventDefault();
                }
                break;
            case "addConnection":
                this.onChange(true);
                break;
            case "removeConnection":
                this.onChange(true);
                break;
        }
    }

    private handleNodeEvent(node: Node, ev: BaklavaEvent<any>) {

        

    }

    private checkConnection(from: NodeInterface, to: NodeInterface) {
        const dc = new DummyConnection(from, to);
        const copy = (this.editor.connections as ReadonlyArray<IConnection>).concat([dc]);
        copy.filter((conn) => conn.to !== to);
        return containsCycle(this.editor.nodes, copy);
    }

    private onChange(recalculateOrder: boolean) {
        this.recalculateOrder = this.recalculateOrder || recalculateOrder;
        if (this.calculateOnChange) {
            this.calculate();
        }
    }

    private calculateNodeTree() {
        this.nodeCalculationOrder = calculateOrder(this.editor.nodes, this.editor.connections);
    }

}

import { Editor, Node } from "../core";
import { calculateOrder } from "./nodeTreeBuilder";

export class Engine {

    private editor: Editor;
    private _nodeCalculationOrder: Node[] = [];

    public constructor(editor: Editor) {
        this.editor = editor;
    }

    /** Calculate all nodes */
    public async calculate() {
        for (const n of this._nodeCalculationOrder) {
            await n.calculate();
        }
    }

    /** Recalculate the node calculation order */
    public calculateNodeTree() {
        this._nodeCalculationOrder = calculateOrder(this.editor.nodes, this.editor.connections);
    }

}

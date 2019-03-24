import { Editor } from "../model";

export class Engine {

    private editor: Editor;

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
        const ntb = new NodeTreeBuilder();
        this._nodeCalculationOrder = ntb.calculateTree(this.nodes, this.connections);
    }

}

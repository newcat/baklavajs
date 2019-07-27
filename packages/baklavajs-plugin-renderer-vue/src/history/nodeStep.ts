import { IStep } from "./step";
import { IEditor, INodeState } from "../../../baklavajs-core/types";

export default class NodeStep implements IStep {

    public type: "addNode"|"removeNode";

    private nodeId?: string;
    private nodeState?: INodeState;

    public constructor(type: "addNode"|"removeNode", data: any) {
        this.type = type;
        if (type === "addNode") {
            this.nodeId = data as string;
        } else {
            this.nodeState = data as INodeState;
        }
    }

    public undo(editor: IEditor) {
        if (this.type === "addNode") {
            this.removeNode(editor);
        } else {
            this.addNode(editor);
        }
    }

    public redo(editor: IEditor) {
        if (this.type === "addNode" && this.nodeState) {
            this.addNode(editor);
        } else if (this.type === "removeNode" && this.nodeId) {
            this.removeNode(editor);
        }
    }

    private addNode(editor: IEditor) {
        const nodeType = editor.nodeTypes.get(this.nodeState!.type);
        if (!nodeType) { return; }
        const n = new nodeType();
        editor.addNode(n);
        n.load(this.nodeState!);
        this.nodeId = n.id;
    }

    private removeNode(editor: IEditor) {
        const node = editor.nodes.find((n) => n.id === this.nodeId);
        if (!node) { return; }
        this.nodeState = node.save();
        editor.removeNode(node);
    }

}

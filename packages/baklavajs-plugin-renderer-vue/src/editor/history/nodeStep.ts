import { Editor, INodeState } from "@baklavajs/core";
import { IStep } from "./step";

export default class NodeStep implements IStep {
    public type: "addNode" | "removeNode";

    private nodeId?: string;
    private nodeState?: INodeState<any, any>;

    public constructor(type: "addNode" | "removeNode", data: any) {
        this.type = type;
        if (type === "addNode") {
            this.nodeId = data as string;
        } else {
            this.nodeState = data as INodeState<any, any>;
        }
    }

    public undo(editor: Editor) {
        if (this.type === "addNode") {
            this.removeNode(editor);
        } else {
            this.addNode(editor);
        }
    }

    public redo(editor: Editor) {
        if (this.type === "addNode" && this.nodeState) {
            this.addNode(editor);
        } else if (this.type === "removeNode" && this.nodeId) {
            this.removeNode(editor);
        }
    }

    private addNode(editor: Editor) {
        const nodeType = editor.nodeTypes.get(this.nodeState!.type);
        if (!nodeType) {
            return;
        }
        const n = new nodeType();
        editor.addNode(n);
        n.load(this.nodeState!);
        this.nodeId = n.id;
    }

    private removeNode(editor: Editor) {
        const node = editor.nodes.find((n) => n.id === this.nodeId);
        if (!node) {
            return;
        }
        this.nodeState = node.save();
        editor.removeNode(node);
    }
}

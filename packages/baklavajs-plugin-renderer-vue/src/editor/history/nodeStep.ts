import { Graph, INodeState } from "@baklavajs/core";
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

    public undo(graph: Graph) {
        if (this.type === "addNode") {
            this.removeNode(graph);
        } else {
            this.addNode(graph);
        }
    }

    public redo(graph: Graph) {
        if (this.type === "addNode" && this.nodeState) {
            this.addNode(graph);
        } else if (this.type === "removeNode" && this.nodeId) {
            this.removeNode(graph);
        }
    }

    private addNode(graph: Graph) {
        const nodeType = graph.editor.nodeTypes.get(this.nodeState!.type);
        if (!nodeType) {
            return;
        }
        const n = new nodeType.type();
        graph.addNode(n);
        n.load(this.nodeState!);
        this.nodeId = n.id;
    }

    private removeNode(graph: Graph) {
        const node = graph.nodes.find((n) => n.id === this.nodeId);
        if (!node) {
            return;
        }
        this.nodeState = node.save();
        graph.removeNode(node);
    }
}

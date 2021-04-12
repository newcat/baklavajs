import { v4 as uuidv4 } from "uuid";
import {
    Editor,
    AbstractNode,
    INodeState,
    IConnectionState,
    Connection,
    NodeInterface,
    NodeInterfaceFactory,
} from "@baklavajs/core";

export default class Clipboard {
    private editor: Editor;

    private nodeBuffer = "";
    private connectionBuffer = "";

    public get isEmpty() {
        return !this.nodeBuffer;
    }

    public constructor(editor: Editor) {
        this.editor = editor;
    }

    public clear() {
        this.nodeBuffer = "";
        this.connectionBuffer = "";
    }

    public copy(selectedNodes: AbstractNode[]) {
        this.connectionBuffer = JSON.stringify(
            this.editor.connections
                .filter((conn) => selectedNodes.includes(conn.from.parent!) && selectedNodes.includes(conn.to.parent!))
                .map((conn) => ({ from: conn.from.id, to: conn.to.id } as IConnectionState))
        );

        this.nodeBuffer = JSON.stringify(selectedNodes.map((n) => n.save()));
    }

    public paste() {
        // Map old IDs to new IDs
        const idmap = new Map<string, string>();

        const parsedNodeBuffer = JSON.parse(this.nodeBuffer) as INodeState<any, any>[];
        const parsedConnectionBuffer = JSON.parse(this.connectionBuffer) as IConnectionState[];

        const newNodes: AbstractNode[] = [];
        const newConnections: Connection[] = [];

        for (const n of parsedNodeBuffer) {
            const nodeType = this.editor.nodeTypes.get(n.type);
            if (!nodeType) {
                console.warn(`Node type ${n.type} not registered`);
                return;
            }
            const copiedNode = new nodeType();
            const generatedId = copiedNode.id;
            newNodes.push(copiedNode);

            const tapInterfaces = (intfs: Record<string, NodeInterface<any>>) => {
                Object.values(intfs).forEach((intf) => {
                    intf.hooks.load.tap(this, (intfState) => {
                        const newIntfId = uuidv4();
                        idmap.set(intfState.id, newIntfId);
                        intf.id = newIntfId;
                        intf.hooks.load.untap(this);
                        return intfState;
                    });
                });
            };

            tapInterfaces(copiedNode.inputs);
            tapInterfaces(copiedNode.outputs);

            copiedNode.hooks.beforeLoad.tap(this, (nodeState) => {
                const ns = nodeState as any;
                if (ns.position) {
                    ns.position.x += 10;
                    ns.position.y += 10;
                }
                return ns;
            });

            this.editor.addNode(copiedNode);
            copiedNode.load(n);
            copiedNode.id = generatedId;
            idmap.set(n.id, generatedId);
        }

        for (const c of parsedConnectionBuffer) {
            const fromIntf = this.findInterface(newNodes, idmap.get(c.from)!, "output");
            const toIntf = this.findInterface(newNodes, idmap.get(c.to)!, "input");
            if (!fromIntf || !toIntf) {
                continue;
            }
            const newConnection = this.editor.addConnection(fromIntf, toIntf);
            if (newConnection) {
                newConnections.push(newConnection);
            }
        }

        return {
            newNodes,
            newConnections,
        };
    }

    private findInterface(nodes: AbstractNode[], id: string, io?: "input" | "output"): NodeInterface<any> | undefined {
        for (const n of nodes) {
            let intf: NodeInterface<any> | undefined;
            if (!io || io === "input") {
                intf = Object.values(n.inputs).find((intf) => intf.id === id);
            }
            if (!intf && (!io || io === "output")) {
                intf = Object.values(n.outputs).find((intf) => intf.id === id);
            }
            if (intf) {
                return intf;
            }
        }
        return undefined;
    }
}

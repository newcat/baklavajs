import { v4 as uuidv4 } from "uuid";
import { AbstractNode, INodeState, IConnectionState, Connection, NodeInterface } from "@baklavajs/core";
import { ViewPlugin } from "./viewPlugin";
import { COMMIT_TRANSACTION_COMMAND, START_TRANSACTION_COMMAND } from "./history";

export const COPY_COMMAND = "COPY";
export const PASTE_COMMAND = "PASTE";

export class Clipboard {
    private nodeBuffer = "";
    private connectionBuffer = "";

    public get isEmpty() {
        return !this.nodeBuffer;
    }

    public constructor(private readonly plugin: ViewPlugin) {
        plugin.registerCommand(COPY_COMMAND, () => this.copy());
        plugin.hotkeyHandler.registerCommand(["Control", "c"], COPY_COMMAND);

        plugin.registerCommand(PASTE_COMMAND, () => this.paste());
        plugin.hotkeyHandler.registerCommand(["Control", "v"], PASTE_COMMAND);
    }

    public clear() {
        this.nodeBuffer = "";
        this.connectionBuffer = "";
    }

    public copy() {
        // find all connections from and to the selected nodes
        const interfacesOfSelectedNodes = this.plugin.selectedNodes.flatMap((n) => [
            ...Object.values(n.inputs),
            ...Object.values(n.outputs),
        ]);

        const connections = this.plugin.displayedGraph.connections
            .filter(
                (conn) => interfacesOfSelectedNodes.includes(conn.from) || interfacesOfSelectedNodes.includes(conn.to)
            )
            .map((conn) => ({ from: conn.from.id, to: conn.to.id } as IConnectionState));

        this.connectionBuffer = JSON.stringify(connections);
        this.nodeBuffer = JSON.stringify(this.plugin.selectedNodes.map((n) => n.save()));
    }

    public paste() {
        if (this.isEmpty) {
            return;
        }

        // Map old IDs to new IDs
        const idmap = new Map<string, string>();

        const parsedNodeBuffer = JSON.parse(this.nodeBuffer) as INodeState<any, any>[];
        const parsedConnectionBuffer = JSON.parse(this.connectionBuffer) as IConnectionState[];

        const newNodes: AbstractNode[] = [];
        const newConnections: Connection[] = [];

        const graph = this.plugin.displayedGraph;

        this.plugin.executeCommand(START_TRANSACTION_COMMAND);

        for (const n of parsedNodeBuffer) {
            const nodeType = this.plugin.editor.nodeTypes.get(n.type);
            if (!nodeType) {
                console.warn(`Node type ${n.type} not registered`);
                return;
            }
            const copiedNode = new nodeType.type();
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

            graph.addNode(copiedNode);
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
            const newConnection = graph.addConnection(fromIntf, toIntf);
            if (newConnection) {
                newConnections.push(newConnection);
            }
        }

        this.plugin.executeCommand(COMMIT_TRANSACTION_COMMAND);

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

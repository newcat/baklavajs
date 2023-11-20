import { computed, reactive, Ref, ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { AbstractNode, INodeState, IConnectionState, Connection, NodeInterface, Editor, Graph } from "@baklavajs/core";
import {
    CommitTransactionCommand,
    COMMIT_TRANSACTION_COMMAND,
    StartTransactionCommand,
    START_TRANSACTION_COMMAND,
} from "./history";
import { ICommand, ICommandHandler } from "./commands";

export const COPY_COMMAND = "COPY";
export const PASTE_COMMAND = "PASTE";
export const CLEAR_CLIPBOARD_COMMAND = "CLEAR_CLIPBOARD";

export type CopyCommand = ICommand<void>;
export type PasteCommand = ICommand<void>;
export type ClearClipboardCommand = ICommand<void>;

export interface IClipboard {
    isEmpty: boolean;
}

export function useClipboard(
    displayedGraph: Ref<Graph>,
    editor: Ref<Editor>,
    commandHandler: ICommandHandler
): IClipboard {
    const token = Symbol("ClipboardToken");

    const nodeBuffer = ref("");
    const connectionBuffer = ref("");

    const isEmpty = computed(() => !nodeBuffer.value);

    const clear = () => {
        nodeBuffer.value = "";
        connectionBuffer.value = "";
    };

    const copy = () => {
        // find all connections from and to the selected nodes
        const interfacesOfSelectedNodes = displayedGraph.value.selectedNodes.flatMap((n) => [
            ...Object.values(n.inputs),
            ...Object.values(n.outputs),
        ]);

        const connections = displayedGraph.value.connections
            .filter(
                (conn) => interfacesOfSelectedNodes.includes(conn.from) || interfacesOfSelectedNodes.includes(conn.to)
            )
            .map((conn) => ({ from: conn.from.id, to: conn.to.id } as IConnectionState));

        connectionBuffer.value = JSON.stringify(connections);
        nodeBuffer.value = JSON.stringify(displayedGraph.value.selectedNodes.map((n) => n.save()));
    };

    const findInterface = (
        nodes: AbstractNode[],
        id: string,
        io?: "input" | "output"
    ): NodeInterface<any> | undefined => {
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
    };

    const paste = () => {
        if (isEmpty.value) {
            return;
        }

        // Map old IDs to new IDs
        const idmap = new Map<string, string>();

        const parsedNodeBuffer = JSON.parse(nodeBuffer.value) as INodeState<any, any>[];
        const parsedConnectionBuffer = JSON.parse(connectionBuffer.value) as IConnectionState[];

        const newNodes: AbstractNode[] = [];
        const newConnections: Connection[] = [];

        const graph = displayedGraph.value;

        commandHandler.executeCommand<StartTransactionCommand>(START_TRANSACTION_COMMAND);

        for (const oldNode of parsedNodeBuffer) {
            const nodeType = editor.value.nodeTypes.get(oldNode.type);
            if (!nodeType) {
                console.warn(`Node type ${oldNode.type} not registered`);
                return;
            }
            const copiedNode = new nodeType.type();
            const generatedId = copiedNode.id;
            newNodes.push(copiedNode);

            const tapInterfaces = (intfs: Record<string, NodeInterface<any>>) => {
                Object.values(intfs).forEach((intf) => {
                    intf.hooks.load.subscribe(token, (intfState) => {
                        const newIntfId = uuidv4();
                        idmap.set(intfState.id, newIntfId);
                        intf.id = newIntfId;
                        intf.hooks.load.unsubscribe(token);
                        return intfState;
                    });
                });
            };

            tapInterfaces(copiedNode.inputs);
            tapInterfaces(copiedNode.outputs);

            copiedNode.hooks.beforeLoad.subscribe(token, (nodeState) => {
                const ns = nodeState as any;
                if (ns.position) {
                    ns.position.x += 100;
                    ns.position.y += 100;
                }
                copiedNode.hooks.beforeLoad.unsubscribe(token);
                return ns;
            });

            graph.addNode(copiedNode);
            copiedNode.load({ ...oldNode, id: generatedId });
            copiedNode.id = generatedId;
            idmap.set(oldNode.id, generatedId);
        }

        for (const c of parsedConnectionBuffer) {
            const fromIntf = findInterface(newNodes, idmap.get(c.from)!, "output");
            const toIntf = findInterface(newNodes, idmap.get(c.to)!, "input");
            if (!fromIntf || !toIntf) {
                continue;
            }
            const newConnection = graph.addConnection(fromIntf, toIntf);
            if (newConnection) {
                newConnections.push(newConnection);
            }
        }

        commandHandler.executeCommand<CommitTransactionCommand>(COMMIT_TRANSACTION_COMMAND);

        return {
            newNodes,
            newConnections,
        };
    };

    commandHandler.registerCommand(COPY_COMMAND, {
        canExecute: () => true,
        execute: copy,
    });
    commandHandler.registerHotkey(["Control", "c"], COPY_COMMAND);
    commandHandler.registerCommand(PASTE_COMMAND, {
        canExecute: () => !isEmpty.value,
        execute: paste,
    });
    commandHandler.registerHotkey(["Control", "v"], PASTE_COMMAND);
    commandHandler.registerCommand(CLEAR_CLIPBOARD_COMMAND, {
        canExecute: () => true,
        execute: clear,
    });

    return reactive({ isEmpty });
}

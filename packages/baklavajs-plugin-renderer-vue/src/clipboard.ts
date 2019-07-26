import { IEditor, INode, INodeState, IConnectionState } from "../../baklavajs-core/types";

export default class Clipboard {

    private editor: IEditor;

    private nodeBuffer: string = "";
    private connectionBuffer: string = "";

    public get isEmpty() {
        return !this.nodeBuffer;
    }

    public constructor(editor: IEditor) {
        this.editor = editor;
    }

    public clear() {
        this.nodeBuffer = "";
        this.connectionBuffer = "";
    }

    public copy(selectedNodes: INode[]) {

        this.connectionBuffer = JSON.stringify(this.editor.connections
            .filter((conn) => selectedNodes.includes(conn.from.parent) && selectedNodes.includes(conn.to.parent))
            .map((conn) => ({ from: conn.from.id, to: conn.to.id } as IConnectionState)));

        this.nodeBuffer = JSON.stringify(selectedNodes.map((n) => n.save()));

    }

    public paste() {

        // Map old IDs to new IDs
        const idmap = new Map<string, string>();

        // TODO: What is this?
        const intfmap = new Map<string, string>();

        const parsedNodeBuffer = JSON.parse(this.nodeBuffer) as INodeState[];
        const parsedConnectionBuffer = JSON.parse(this.connectionBuffer) as IConnectionState[];

        for (const n of parsedNodeBuffer) {
            const nodeType = this.editor.nodeTypes.get(n.type);
            if (!nodeType) {
                // tslint:disable-next-line: no-console
                console.warn(`Node type ${n.type} not registered`);
                return;
            }
            const copiedNode = new nodeType();
            const generatedId = copiedNode.id;

            copiedNode.interfaces.forEach((intf) => {
                intf.hooks.load.tap(this, (intfState) => {
                    const newIntfId = this.editor.generateId("ni");
                    idmap.set(intfState.id, newIntfId);
                    intfmap.set(intfState.id, generatedId);
                    intf.id = newIntfId;
                    intf.hooks.load.untap(this);
                    return intfState;
                });
            });

            copiedNode.hooks.load.tap(this, (nodeState) => {
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
            const fromNode = this.editor.nodes.find((n) => n.id === intfmap.get(c.from));
            const toNode = this.editor.nodes.find((n) => n.id === intfmap.get(c.to));
            if (!fromNode || !toNode) { continue; }
            const fromIntf = Array.from(fromNode.interfaces.values()).find((intf) => intf.id === idmap.get(c.from));
            const toIntf = Array.from(toNode.interfaces.values()).find((intf) => intf.id === idmap.get(c.to));
            if (!fromIntf || !toIntf) { continue; }
            this.editor.addConnection(fromIntf, toIntf);
        }

    }

}

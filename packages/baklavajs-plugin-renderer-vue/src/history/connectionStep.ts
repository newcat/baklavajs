import { IStep } from "./step";
import { IEditor, IConnectionState, IConnection } from "../../../baklavajs-core/types";

export default class ConnectionStep implements IStep {

    public type: "addConnection"|"removeConnection";

    private connectionId?: string;
    private connectionState?: IConnectionState;

    public constructor(type: "addConnection"|"removeConnection", data: string|IConnection) {
        this.type = type;
        if (type === "addConnection") {
            this.connectionId = data as string;
        } else {
            const d = data as IConnection;
            this.connectionState = {
                id: d.id,
                from: d.from.id,
                to: d.to.id
            };
        }
    }

    public undo(editor: IEditor) {
        if (this.type === "addConnection") {
            this.removeConnection(editor);
        } else {
            this.addConnection(editor);
        }
    }

    public redo(editor: IEditor) {
        if (this.type === "addConnection" && this.connectionState) {
            this.addConnection(editor);
        } else if (this.type === "removeConnection" && this.connectionId) {
            this.removeConnection(editor);
        }
    }

    private addConnection(editor: IEditor) {
        const fromIntf = editor.findNodeInterface(this.connectionState!.from);
        const toIntf = editor.findNodeInterface(this.connectionState!.to);
        if (!fromIntf || !toIntf) { return; }
        editor.addConnection(fromIntf, toIntf);
    }

    private removeConnection(editor: IEditor) {
        const connection = editor.connections.find((c) => c.id === this.connectionId);
        if (!connection) { return; }
        this.connectionState = {
            id: connection.id,
            from: connection.from.id,
            to: connection.to.id
        };
        editor.removeConnection(connection);
    }

}

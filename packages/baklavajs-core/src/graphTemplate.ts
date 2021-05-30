import { v4 as uuidv4 } from "uuid";
import { BaklavaEvent } from "@baklavajs/events";
import type { IConnectionState } from "./connection";
import type { Editor } from "./editor";
import { Graph, IGraphInterface, IGraphState } from "./graph";
import type { INodeState } from "./node";
import type { INodeInterfaceState } from "./nodeInterface";
import { mapValues } from "./utils";

export class GraphTemplate implements IGraphState {
    public static fromGraph(graph: Graph, editor: Editor): GraphTemplate {
        return new GraphTemplate(graph.save(), editor);
    }

    public id = uuidv4();
    public name = "Subgraph";
    public nodes!: Array<INodeState<unknown, unknown>>;
    public connections!: IConnectionState[];
    public inputs!: IGraphInterface[];
    public outputs!: IGraphInterface[];

    public editor: Editor;

    constructor(state: Omit<IGraphState, "id">, editor: Editor) {
        this.editor = editor;
        this.update(state);
    }

    public events = {
        updated: new BaklavaEvent<void>(),
    };

    public update(state: Omit<IGraphState, "id">) {
        this.nodes = state.nodes;
        this.connections = state.connections;
        this.inputs = state.inputs;
        this.outputs = state.outputs;
        this.events.updated.emit();
    }

    public createGraph(graph?: Graph): Graph {
        const idMap = new Map<string, string>();

        const createNewId = (oldId: string): string => {
            const newId = uuidv4();
            idMap.set(oldId, newId);
            return newId;
        };

        const getNewId = (oldId: string): string => {
            const newId = idMap.get(oldId);
            if (!newId) {
                throw new Error(`Unable to create graph from template: Could not map old id ${oldId} to new id`);
            }
            return newId;
        };

        const mapNodeInterfaceIds = (interfaceStates: Record<string, INodeInterfaceState<any>>) => {
            return mapValues(interfaceStates, (intf) => {
                const clonedIntf: INodeInterfaceState<any> = {
                    id: createNewId(intf.id),
                    value: intf.value,
                };
                return clonedIntf;
            });
        };

        const nodes: Array<INodeState<unknown, unknown>> = this.nodes.map((n) => ({
            ...n,
            id: createNewId(n.id),
            inputs: mapNodeInterfaceIds(n.inputs),
            outputs: mapNodeInterfaceIds(n.outputs),
        }));

        const connections: IConnectionState[] = this.connections.map((c) => ({
            id: createNewId(c.id),
            from: getNewId(c.from),
            to: getNewId(c.to),
        }));

        const inputs: IGraphInterface[] = this.inputs.map((i) => ({
            id: i.id,
            name: i.name,
            nodeInterfaceId: getNewId(i.nodeInterfaceId),
        }));

        const outputs: IGraphInterface[] = this.outputs.map((o) => ({
            id: o.id,
            name: o.name,
            nodeInterfaceId: getNewId(o.nodeInterfaceId),
        }));

        const clonedState: IGraphState = {
            id: uuidv4(),
            nodes,
            connections,
            inputs,
            outputs,
        };

        if (!graph) {
            graph = new Graph(this.editor);
        }
        graph.load(clonedState);
        graph.template = this;
        return graph;
    }
}

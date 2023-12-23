import { v4 as uuidv4 } from "uuid";
import { BaklavaEvent, SequentialHook } from "@baklavajs/events";
import type { IConnectionState } from "./connection";
import type { Editor } from "./editor";
import { Graph, IGraphState } from "./graph";
import type { INodeState } from "./node";
import type { INodeInterfaceState } from "./nodeInterface";
import { mapValues } from "./utils";
import { getGraphNodeTypeString } from "./graphNode";
import {
    GRAPH_INPUT_NODE_TYPE,
    GRAPH_OUTPUT_NODE_TYPE,
    GraphInputNodeState,
    GraphOutputNodeState,
    IGraphInterface,
} from "./graphInterface";

type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

export interface IGraphTemplateState extends IGraphState {
    name: string;
}

export class GraphTemplate implements IGraphState {
    /** Create a new GraphTemplate from the nodes and connections inside the graph instance */
    public static fromGraph(graph: Graph, editor: Editor): GraphTemplate {
        return new GraphTemplate(graph.save(), editor);
    }

    /** Graph template id */
    public id = uuidv4();

    /** List of all node states in this graph template */
    public nodes!: Array<INodeState<unknown, unknown>>;

    /** List of all connection states in this graph template */
    public connections!: IConnectionState[];

    /** Editor instance */
    public editor: Editor;

    private _name = "Subgraph";

    /** Get the name of the graph template */
    public get name() {
        return this._name;
    }

    /** Set the name of the graph template */
    public set name(v: string) {
        this._name = v;
        this.events.nameChanged.emit(v);
        const nt = this.editor.nodeTypes.get(getGraphNodeTypeString(this));
        if (nt) {
            nt.title = v;
        }
    }

    /** List of all inputs to the graph template */
    public get inputs(): Readonly<IGraphInterface[]> {
        const inputNodes = this.nodes.filter((n) => n.type === GRAPH_INPUT_NODE_TYPE) as GraphInputNodeState[];
        return inputNodes.map((n) => ({
            id: n.graphInterfaceId,
            name: n.inputs.name.value,
            nodeId: n.id,
            nodeInterfaceId: n.outputs.placeholder.id,
        }));
    }

    /** List of all outputs of the graph template */
    public get outputs(): Readonly<IGraphInterface[]> {
        const outputNodes = this.nodes.filter((n) => n.type === GRAPH_OUTPUT_NODE_TYPE) as GraphOutputNodeState[];
        return outputNodes.map((n) => ({
            id: n.graphInterfaceId,
            name: n.inputs.name.value,
            nodeId: n.id,
            nodeInterfaceId: n.outputs.output.id,
        }));
    }

    constructor(state: Optional<IGraphTemplateState, "id" | "name">, editor: Editor) {
        this.editor = editor;
        if (state.id) {
            this.id = state.id;
        }
        if (state.name) {
            this._name = state.name;
        }
        this.update(state);
    }

    public events = {
        nameChanged: new BaklavaEvent<string, GraphTemplate>(this),
        updated: new BaklavaEvent<void, GraphTemplate>(this),
    } as const;

    public hooks = {
        beforeLoad: new SequentialHook<IGraphTemplateState, GraphTemplate>(this),
        afterSave: new SequentialHook<IGraphTemplateState, GraphTemplate>(this),
    } as const;

    /** Update the state of the graph template with the provided state */
    public update(state: Omit<IGraphState, "id">) {
        this.nodes = state.nodes;
        this.connections = state.connections;
        this.events.updated.emit();
    }

    public save(): IGraphTemplateState {
        return {
            id: this.id,
            name: this.name,
            nodes: this.nodes,
            connections: this.connections,
            inputs: this.inputs,
            outputs: this.outputs,
        };
    }

    /**
     * Create a new graph instance from this template
     * or load the state into the provided graph instance.
     */
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
                    templateId: intf.id,
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
            nodeId: getNewId(i.nodeId),
            nodeInterfaceId: getNewId(i.nodeInterfaceId),
        }));

        const outputs: IGraphInterface[] = this.outputs.map((o) => ({
            id: o.id,
            name: o.name,
            nodeId: getNewId(o.nodeId),
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
        const warnings = graph.load(clonedState);
        warnings.forEach((w) => console.warn(w));

        graph.template = this;
        return graph;
    }
}

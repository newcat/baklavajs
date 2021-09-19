import { Graph, IGraphInterface, IGraphState } from "./graph";
import type { GraphTemplate } from "./graphTemplate";
import { AbstractNode, CalculateFunction, INodeState } from "./node";
import type { NodeInterface } from "./nodeInterface";

export interface IGraphNodeState extends INodeState<any, any> {
    graphState: IGraphState;
}

export interface IGraphNode {
    template: GraphTemplate;
    graph: Graph | undefined;
}

export const GRAPH_NODE_TYPE_PREFIX = "__baklava_GraphNode-";

export function getGraphNodeTypeString(template: GraphTemplate): string {
    return GRAPH_NODE_TYPE_PREFIX + template.id;
}

export function createGraphNodeType(template: GraphTemplate): new () => AbstractNode & IGraphNode {
    return class GraphNode extends AbstractNode implements IGraphNode {
        public type = getGraphNodeTypeString(template);

        private _title = "GraphNode";
        public get title() {
            return this._title;
        }
        public set title(v: string) {
            this.template.name = v;
        }

        public inputs: Record<string, NodeInterface<any>> = {};
        public outputs: Record<string, NodeInterface<any>> = {};

        public template = template;
        public graph: Graph | undefined;

        public calculate?: CalculateFunction<any, any> | undefined;

        public load(state: IGraphNodeState) {
            if (!this.graph) {
                throw new Error("Cannot load a graph node without a graph");
            }
            if (!this.template) {
                throw new Error("Unable to load graph node without graph template");
            }
            this.graph.load(state.graphState);
            super.load(state);
        }

        public save(): IGraphNodeState {
            if (!this.graph) {
                throw new Error("Cannot save a graph node without a graph");
            }
            const state = super.save();
            return {
                ...state,
                graphState: this.graph.save(),
            };
        }

        public onPlaced() {
            this.template.events.updated.subscribe(this, () => this.initialize());
            this.template.events.nameChanged.subscribe(this, (name) => {
                this._title = name;
            });
            this.initialize();
        }

        public destroy() {
            this.template.events.updated.unsubscribe(this);
            this.template.events.nameChanged.unsubscribe(this);
            this.graph?.destroy();
        }

        private initialize() {
            if (this.graph) {
                this.graph.destroy();
            }
            this.graph = this.template.createGraph();
            this._title = this.template.name;
            this.updateInterfaces();
            this.events.update.emit(null);
        }

        private updateInterfaces() {
            // TODO: Initially, this works, but after this node was load()-ed, it breaks

            const inputConnectionsToCreate: Array<[NodeInterface, string]> = [];
            const outputConnectionsToCreate: Array<[string, NodeInterface]> = [];

            this.graphInstance?.connections.forEach((c) => {
                const input = Object.entries(this.inputs).find((i) => i[1] === c.to);
                if (input) {
                    inputConnectionsToCreate.push([c.from, input[0]]);
                }
                const output = Object.entries(this.outputs).find((i) => i[1] === c.from);
                if (output) {
                    outputConnectionsToCreate.push([output[0], c.to]);
                }
            });

            Object.keys(this.inputs).forEach((i) => this.removeInput(i));
            Object.keys(this.outputs).forEach((i) => this.removeOutput(i));

            this.getInterfaceEntries(this.graph!.inputs).forEach(([k, v]) => {
                this.addInput(k, v);
            });
            this.getInterfaceEntries(this.graph!.outputs).forEach(([k, v]) => {
                this.addOutput(k, v);
            });

            inputConnectionsToCreate.forEach(([from, toId]) => {
                this.graphInstance?.addConnection(from, this.inputs[toId]);
            });
            outputConnectionsToCreate.forEach(([fromId, to]) => {
                this.graphInstance?.addConnection(this.outputs[fromId], to);
            });
        }

        private getInterfaceEntries(graphInterfaceList: IGraphInterface[]): Array<[string, NodeInterface<any>]> {
            return graphInterfaceList.map((gi) => {
                const intf = this.graph!.findNodeInterface(gi.nodeInterfaceId);
                if (!intf) {
                    throw new Error(
                        `Error while updating interfaces on GraphNode: Unable to find interface with id ${gi.nodeInterfaceId}`,
                    );
                }
                intf.name = gi.name;
                return [gi.id, intf];
            });
        }
    };
}

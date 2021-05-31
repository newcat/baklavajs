import { Graph, IGraphInterface, IGraphState } from "./graph";
import type { GraphTemplate } from "./graphTemplate";
import { AbstractNode, CalculateFunction, INodeState } from "./node";
import type { NodeInterface } from "./nodeInterface";

export interface IGraphNodeState extends INodeState<any, any> {
    graphState: IGraphState;
}

export interface IGraphNode {
    template: GraphTemplate;
    graph: Graph;
}

export function createGraphNodeType(template: GraphTemplate): new () => AbstractNode & IGraphNode {
    return class GraphNode extends AbstractNode implements IGraphNode {
        public type = `__baklava_GraphNode-${template.id}`;
        public title = "GraphNode";

        public inputs: Record<string, NodeInterface<any>> = {};
        public outputs: Record<string, NodeInterface<any>> = {};

        public template = template;
        public graph!: Graph;

        public calculate?: CalculateFunction<any, any> | undefined;

        public load(state: IGraphNodeState) {
            if (!this.template) {
                throw new Error("Unable to load graph node without graph template");
            }
            const graph = new Graph(this.template.editor);
            graph.load(state.graphState);
            super.load(state);
        }

        public save(): IGraphNodeState {
            const state = super.save();
            return {
                ...state,
                graphState: this.graph.save(),
            };
        }

        public onPlaced() {
            this.template.events.updated.addListener(this, () => this.initialize());
            this.initialize();
        }

        public destroy() {
            this.template.events.updated.removeListener(this);
        }

        private initialize() {
            this.graph = this.template.createGraph();
            this.title = this.template.name;
            this.updateInterfaces();
        }

        private updateInterfaces() {
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

            this.getInterfaceEntries(this.graph.inputs).forEach(([k, v]) => {
                this.addInput(k, v);
            });
            this.getInterfaceEntries(this.graph.outputs).forEach(([k, v]) => {
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
                const intf = this.graph.findNodeInterface(gi.nodeInterfaceId);
                if (!intf) {
                    throw new Error(
                        `Error while updating interfaces on GraphNode: Unable to find interface with id ${gi.nodeInterfaceId}`
                    );
                }
                intf.name = gi.name;
                return [gi.id, intf];
            });
        }
    };
}

import type { GraphTemplate } from "./graphTemplate";
import { Graph, IGraphState } from "./graph";
import { AbstractNode, CalculateFunction, INodeState } from "./node";
import { NodeInterface } from "./nodeInterface";

export interface IGraphNodeState extends INodeState<any, any> {
    graphState: IGraphState;
}

export interface IGraphNode {
    template: GraphTemplate;
    subgraph: Graph | undefined;
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
        public subgraph: Graph | undefined;

        public override calculate: CalculateFunction<Record<string, any>, Record<string, any>> = async (
            inputs,
            context,
        ) => {
            if (!this.subgraph) {
                throw new Error(`GraphNode ${this.id}: calculate called without subgraph being initialized`);
            }

            if (
                typeof context.engine === "object" &&
                !!context.engine &&
                typeof context.engine.runGraph === "function"
            ) {
                const graphInputs: Map<string, any> = new Map();

                // gather all values of the unconnected inputs
                for (const n of this.subgraph.nodes) {
                    Object.values(n.inputs).forEach((ni) => {
                        if (ni.connectionCount === 0) {
                            graphInputs.set(ni.id, ni.value);
                        }
                    });
                }

                // map graph inputs to their respective nodeInterfaceId in the graph
                Object.entries(inputs).forEach(([k, v]) => {
                    const gi = this.subgraph!.inputs.find((x) => x.id === k)!;
                    graphInputs.set(gi.nodeInterfaceId, v);
                });

                const result: Map<string, Map<string, any>> = await context.engine.runGraph(
                    this.subgraph,
                    graphInputs,
                    context.globalValues,
                );
                const flatResult: Map<string, any> = new Map();
                result.forEach((nodeOutputs, nodeId) => {
                    const node = this.subgraph!.nodes.find((n) => n.id === nodeId)!;
                    nodeOutputs.forEach((v, nodeInterfaceKey) => {
                        flatResult.set(node.outputs[nodeInterfaceKey].id, v);
                    });
                });

                const outputs: Record<string, any> = {};
                this.subgraph.outputs.forEach((graphOutput) => {
                    outputs[graphOutput.id] = flatResult.get(graphOutput.nodeInterfaceId);
                });

                return outputs;
            }
        };

        public override load(state: IGraphNodeState) {
            if (!this.subgraph) {
                throw new Error("Cannot load a graph node without a graph");
            }
            if (!this.template) {
                throw new Error("Unable to load graph node without graph template");
            }
            this.subgraph.load(state.graphState);
            super.load(state);
        }

        public override save(): IGraphNodeState {
            if (!this.subgraph) {
                throw new Error("Cannot save a graph node without a graph");
            }
            const state = super.save();
            return {
                ...state,
                graphState: this.subgraph.save(),
            };
        }

        public override onPlaced() {
            this.template.events.updated.subscribe(this, () => this.initialize());
            this.template.events.nameChanged.subscribe(this, (name) => {
                this._title = name;
            });
            this.initialize();
        }

        public override onDestroy() {
            this.template.events.updated.unsubscribe(this);
            this.template.events.nameChanged.unsubscribe(this);
            this.subgraph?.destroy();
        }

        private initialize() {
            if (this.subgraph) {
                this.subgraph.destroy();
            }
            this.subgraph = this.template.createGraph();
            this._title = this.template.name;
            this.updateInterfaces();
            this.events.update.emit(null);
        }

        private updateInterfaces() {
            // TODO: Check if TODO below still applies
            // TODO: Initially, this works, but after this node was load()-ed, it breaks

            if (!this.subgraph) {
                throw new Error("Trying to update interfaces without graph instance");
            }

            for (const graphInput of this.subgraph.inputs) {
                if (!(graphInput.id in this.inputs)) {
                    this.addInput(graphInput.id, new NodeInterface(graphInput.name, undefined));
                } else {
                    this.inputs[graphInput.id].name = graphInput.name;
                }
            }
            for (const k of Object.keys(this.inputs)) {
                if (!this.subgraph.inputs.some((gi) => gi.id === k)) {
                    this.removeInput(k);
                }
            }

            for (const graphOutput of this.subgraph.outputs) {
                if (!(graphOutput.id in this.outputs)) {
                    this.addOutput(graphOutput.id, new NodeInterface(graphOutput.name, undefined));
                } else {
                    this.outputs[graphOutput.id].name = graphOutput.name;
                }
            }
            for (const k of Object.keys(this.outputs)) {
                if (!this.subgraph.outputs.some((gi) => gi.id === k)) {
                    this.removeOutput(k);
                }
            }
        }
    };
}

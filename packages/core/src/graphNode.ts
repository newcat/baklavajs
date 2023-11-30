import {
    GRAPH_TEMPLATE_INPUT_NODE_TYPE,
    GraphTemplateInputNode,
    type GraphTemplate,
    GRAPH_TEMPLATE_OUTPUT_NODE_TYPE,
    GraphTemplateOutputNode,
} from "./graphTemplate";
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

        public override get title() {
            return this._title;
        }
        public override set title(v: string) {
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
            if (!context.engine || typeof context.engine !== "object") {
                throw new Error(`GraphNode ${this.id}: calculate called but no engine provided in context`);
            }

            const graphInputs = context.engine.getInputValues(this.subgraph);

            // fill subgraph input placeholders
            const inputNodes = this.subgraph.nodes.filter(
                (n) => n.type === GRAPH_TEMPLATE_INPUT_NODE_TYPE,
            ) as GraphTemplateInputNode[];
            for (const inputNode of inputNodes) {
                graphInputs.set(inputNode.outputs.placeholder.id, inputs[inputNode.graphInterfaceId]);
            }

            const result: Map<string, Map<string, any>> = await context.engine.runGraph(
                this.subgraph,
                graphInputs,
                context.globalValues,
            );

            const outputs: Record<string, any> = {};
            const outputNodes = this.subgraph.nodes.filter(
                (n) => n.type === GRAPH_TEMPLATE_OUTPUT_NODE_TYPE,
            ) as unknown as GraphTemplateOutputNode[];
            for (const outputNode of outputNodes) {
                console.log("Output node ID", outputNode.id);
                outputs[outputNode.graphInterfaceId] = result.get(outputNode.id)?.get("output");
            }

            outputs._calculationResults = result;

            return outputs;
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

            // Add an internal output to allow accessing the calculation results of nodes inside the graph
            this.addOutput("_calculationResults", new NodeInterface("_calculationResults", undefined).setHidden(true));
        }
    };
}

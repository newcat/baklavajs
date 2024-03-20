import { GraphInputNode, GraphOutputNode, IGraphInterface } from "./graphInterface";
import { type GraphTemplate } from "./graphTemplate";
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

/** Properties that should not be proxied to the original interface */
const PROXY_INTERFACE_SKIP_PROPERTIES: Array<string | symbol> = [
    "component",
    "connectionCount",
    "events",
    "hidden",
    "hooks",
    "id",
    "isInput",
    "name",
    "nodeId",
    "port",
    "templateId",
    "value",
] satisfies Array<keyof NodeInterface>;

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
            for (const input of this.subgraph.inputs) {
                graphInputs.set(input.nodeInterfaceId, inputs[input.id]);
            }

            const result: Map<string, Map<string, any>> = await context.engine.runGraph(
                this.subgraph,
                graphInputs,
                context.globalValues,
            );

            const outputs: Record<string, any> = {};
            for (const output of this.subgraph.outputs) {
                outputs[output.id] = result.get(output.nodeId)?.get("output");
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
                    this.addInput(graphInput.id, this.createProxyInterface(graphInput, true));
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
                    this.addOutput(graphOutput.id, this.createProxyInterface(graphOutput, false));
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

        /**
         * When we create a interface in the graph node, we hide certain properties of the interface in the subgraph.
         * For example, the `type` property or the `allowMultipleConnections` property.
         * These properties should be proxied to the subgraph interface, so they behave the same as the original interface.
         */
        private createProxyInterface(graphInterface: IGraphInterface, isInput: boolean) {
            const newInterface = new NodeInterface(graphInterface.name, undefined);
            return new Proxy(newInterface, {
                get: (target, prop) => {
                    // we can't proxy the "__v_isRef" property, otherwise we get a maximum stack size exceeded error
                    if (
                        PROXY_INTERFACE_SKIP_PROPERTIES.includes(prop) ||
                        prop in target ||
                        (typeof prop === "string" && prop.startsWith("__v_"))
                    ) {
                        return Reflect.get(target, prop);
                    }
                    // try to find the interface connected to our graph input
                    let placeholderIntfId: string | undefined;
                    if (isInput) {
                        const subgraphInterfaceNode = this.subgraph?.nodes.find(
                            (n) => GraphInputNode.isGraphInputNode(n) && n.graphInterfaceId === graphInterface.id,
                        ) as GraphInputNode | undefined;
                        placeholderIntfId = subgraphInterfaceNode?.outputs.placeholder.id;
                    } else {
                        const subgraphInterfaceNode = this.subgraph?.nodes.find(
                            (n) => GraphOutputNode.isGraphOutputNode(n) && n.graphInterfaceId === graphInterface.id,
                        ) as GraphOutputNode | undefined;
                        placeholderIntfId = subgraphInterfaceNode?.inputs.placeholder.id;
                    }
                    const conn = this.subgraph?.connections.find(
                        (c) => placeholderIntfId === (isInput ? c.from : c.to)?.id,
                    );
                    const intf = isInput ? conn?.to : conn?.from;
                    if (intf) {
                        return Reflect.get(intf, prop);
                    }
                    return undefined;
                },
            });
        }
    };
}

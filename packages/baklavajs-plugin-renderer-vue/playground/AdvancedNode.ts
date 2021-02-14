import { Node, INodeState, NodeInterfaceDefinition, NodeInterface } from "@baklavajs/core";
import { ButtonInterface } from "@baklavajs/plugin-renderer-vue";

export default class AdvancedNode extends Node<NodeInterfaceDefinition, NodeInterfaceDefinition> {
    public type = "AdvancedNode";
    public title = this.type;

    public inputs: NodeInterfaceDefinition = {};
    public outputs: NodeInterfaceDefinition = {};

    private counter = 0;

    public constructor() {
        super();
        this.addInput(
            "addInput",
            new ButtonInterface("Add Input", () => {
                const name = "Input " + ++this.counter;
                this.addInput(name, new NodeInterface<any>(name, undefined));
            })
        );
        this.addInput(
            "addInput",
            new ButtonInterface("Add Input", () => {
                this.removeInput("Input " + this.counter--);
            })
        );
    }

    public load(state: INodeState<NodeInterfaceDefinition, NodeInterfaceDefinition>) {
        Object.entries(state.inputs).forEach(([name, intfState]) => {
            const intf = new NodeInterface<any>(name, intfState.value);
            intf.load(intfState);
            this.addInput(name, intf);
        });
        this.counter = Object.keys(state.inputs).length - 2;
        super.load(state);
    }
}

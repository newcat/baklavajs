import { Node, INodeState, NodeInterfaceDefinition, NodeInterface } from "@baklavajs/core";
import { ButtonInterface } from "../src";

export default class AdvancedNode extends Node<
    NodeInterfaceDefinition<Record<string, any>>,
    NodeInterfaceDefinition<Record<string, any>>
> {
    public type = "AdvancedNode";
    public title = this.type;

    public inputs: NodeInterfaceDefinition<Record<string, any>> = {};
    public outputs: NodeInterfaceDefinition<Record<string, any>> = {};

    private counter = 0;

    public constructor() {
        super();
        this.addInput(
            "addInput",
            new ButtonInterface("Add Input", () => {
                const name = "Input " + ++this.counter;
                this.addInput(name, new NodeInterface<any>(name, undefined));
            }),
        );
        this.addInput(
            "removeInput",
            new ButtonInterface("Remove Input", () => {
                this.removeInput("Input " + this.counter--);
            }),
        );
    }

    public load(
        state: INodeState<NodeInterfaceDefinition<Record<string, any>>, NodeInterfaceDefinition<Record<string, any>>>,
    ) {
        Object.entries(state.inputs).forEach(([name, intfState]) => {
            const intf = new NodeInterface<any>(name, intfState.value);
            intf.load(intfState);
            this.addInput(name, intf);
        });
        this.counter = Object.keys(state.inputs).length - 2;
        super.load(state);
    }
}

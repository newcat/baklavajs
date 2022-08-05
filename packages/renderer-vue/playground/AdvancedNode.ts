import { INodeState, NodeInterface, AbstractNode, CalculateFunction } from "@baklavajs/core";
import { ButtonInterface } from "../src";

export default class AdvancedNode extends AbstractNode {
    public type = "AdvancedNode";
    public title = this.type;

    public inputs: Record<string, NodeInterface<any>> = {};
    public outputs: Record<string, NodeInterface<any>> = {};

    private counter = 0;

    public onPlaced() {
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

    public load(state: INodeState<any, any>) {
        Object.entries(state.inputs).forEach(([name, intfState]) => {
            if (name !== "addInput" && name !== "removeInput") {
                const intf = new NodeInterface(name, intfState.value);
                intf.load(intfState);
                this.addInput(name, intf);
            }
        });
        this.counter = Object.keys(state.inputs).length - 2;
        super.load(state);
    }

    calculate?: CalculateFunction<any, any> | undefined;
}

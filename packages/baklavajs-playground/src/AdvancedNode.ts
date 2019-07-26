import { Node } from "../../baklavajs-core/src";
import { INodeState } from "../../baklavajs-core/types";

export default class AdvancedNode extends Node {

    public type = "AdvancedNode";
    public name = this.type;

    private counter = 0;

    public constructor() {
        super();
        this.addOption("Add Input", "AddOption");
        this.addOption("Remove Input", "AddOption");
    }

    public load(state: INodeState) {
        state.interfaces.forEach(([name, intfState]) => {
            const intf = this.addInputInterface(name);
            intf!.id = intfState.id;
        });
        this.counter = state.interfaces.length;
        super.load(state);
    }

    public action(action: string) {
        if (action === "Add Input") {
            this.addInputInterface("Input " + (++this.counter));
        } else if (action === "Remove Input" && this.counter > 0) {
            this.removeInterface("Input " + (this.counter--));
        }
    }

}

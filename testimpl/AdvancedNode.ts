import { Node } from "../src";

export default class AdvancedNode extends Node {

    public type = "AdvancedNode";
    public name = this.type;

    private counter = 0;

    public constructor() {
        super();
        this.addOption("Add Input", "AddOption");
        this.addOption("Remove Input", "AddOption");
    }

    public action(action: string) {
        if (action === "Add Input") {
            this.addInputInterface("Input " + (++this.counter));
        } else if (action === "Remove Input" && this.counter > 0) {
            this.removeInterface("Input " + (this.counter--));
        }
    }

}

import { Node } from "../../baklavajs-core/src";
import { INodeState } from "../../baklavajs-core/types";

export default class SplitterNode extends Node {
    public type = "SplitterNode";
    public name = "Splitter";

    public constructor() {
        super();
        this.addInputInterface("Source");
        const nrOutputsOption = this.addOption("NrOutputs", "SelectOption", "4", undefined, {
            items: ["2", "4", "6", "8", "16"]
        });
        nrOutputsOption!.events.setValue.addListener(this, () => {
            this.updateOutputs();
        });
        this.updateOutputs();
    }

    public load(state: INodeState) {
        state.interfaces.forEach(([name, intfState]) => {
            if (name.startsWith("Output")) {
                const intf = this.addOutputInterface(name);
                intf!.id = intfState.id;
            }
        });
        super.load(state);
    }

    private updateOutputs() {
        const numberOfOutputs = parseInt(this.getOptionValue("NrOutputs"), 10);
        const outputIntfs = Object.keys(this.outputInterfaces);
        if (outputIntfs.length > numberOfOutputs) {
            // we have more outputs than we need, remove some
            for (let i = numberOfOutputs + 1; i <= outputIntfs.length; i++) {
                this.removeInterface(`Output ${i}`);
            }
        } else if (outputIntfs.length < numberOfOutputs) {
            // we need more outputs
            for (let i = outputIntfs.length + 1; i <= numberOfOutputs; i++) {
                this.addOutputInterface(`Output ${i}`);
            }
        }
    }
}

import { Node, NodeInterface } from "../model";
import InputOption from "../options/InputOption.vue";
import SelectOption from "../options/SelectOption.vue";

export default class TestNode extends Node {

    public type = "TestNode";
    public name = this.type;

    constructor() {
        super();
        this.options = {
            "Select one": {
                selected: "Test1",
                items: [ "Test1", "Test2", "Test3" ]
            }
        };
    }

    public calculate() {
        this.interfaces.OutputIF.value = this.interfaces.InputIF.value;
    }

    public getInterfaces(): Record<string, NodeInterface> {
        return {
            InputIF: new NodeInterface(this, true, "boolean", InputOption),
            OutputIF: new NodeInterface(this, false, "boolean")
        };
    }

    public getOptions() {
        return {
            "test": InputOption,
            "Select one": SelectOption
        };
    }

}

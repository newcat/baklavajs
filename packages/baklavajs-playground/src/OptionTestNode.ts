import { Node } from "@baklavajs/core/src";

export default class OptionTestNode extends Node {
    public type = "OptionTestNode";
    public name = this.type;

    public constructor() {
        super();
        this.addOption("ButtonOption", "ButtonOption");
        this.addOption("CheckboxOption", "CheckboxOption");
        this.addOption("InputOption", "InputOption");
        this.addOption("IntegerOption", "IntegerOption", 5, undefined, { min: 0, max: 10 });
        this.addOption("NumberOption", "NumberOption", 0.5, undefined, { min: 0, max: 1 });
        this.addOption("SelectOption", "SelectOption", "Value 1", undefined, {
            items: ["Value 1", "Value 2", "Value 3"],
        });
        this.addOption("SliderOption", "SliderOption", 0.5);
        this.addOption("TextOption", "TextOption", "My text");
    }
}

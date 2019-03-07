import { Editor, Node, Options } from "../src";

export default class TestNode extends Node {

    public type = "TestNode";
    public name = this.type;
    public registerCalled = false;

    constructor() {
        super();
        this.addInputInterface("Input", "boolean", Options.CheckboxOption);
        this.addInputInterface("Test", "number", Options.NumberOption, 5);
        this.addOutputInterface("Output", "boolean");
        this.addOption("test", Options.InputOption);
        this.addOption("Select", Options.SelectOption, { selected: "Test1", items: ["Test1", "Test2", "Test3"] });
        this.addOption("This is a checkbox", Options.CheckboxOption, true);
        this.addOption("Number", Options.NumberOption, 5);
    }

    public registerEditor(editor: Editor) {
        super.registerEditor(editor);
        this.registerCalled = true;
    }

    public calculate() {
        this.getInterface("Output").value = this.getInterface("Input").value;
    }

}

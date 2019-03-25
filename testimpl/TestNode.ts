import { Editor, Node } from "../src";

export default class TestNode extends Node {

    public type = "TestNode";
    public name = this.type;
    public registerCalled = false;

    constructor() {
        super();
        this.addInputInterface("Input", "boolean", "CheckboxOption");
        this.addInputInterface("Test", "number", "NumberOption", 5);
        this.addOutputInterface("Output", "boolean");
        this.addOption("test", "InputOption");
        this.addOption("Select", "SelectOption", { selected: "Test1", items: ["Test1", "Test2", "Test3"] });
        this.addOption("This is a checkbox", "CheckboxOption", true);
        this.addOption("Number", "NumberOption", 5);
    }

    public registerEditor(editor: Editor) {
        super.registerEditor(editor);
        this.registerCalled = true;
    }

    public calculate() {
        this.getInterface("Output").value = this.getInterface("Input").value;
    }

}

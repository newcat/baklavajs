import { Node, Editor } from "../src";

export default class TestNode extends Node {

    public type = "TestNode";
    public name = "TestNode";

    public registerCalled = false;

    constructor() {
        super();
        this.addInputInterface("Input", "CheckboxOption", false, { type: "boolean" });
        this.addOutputInterface("Output", { type: "boolean" });
    }

    public registerEditor(editor: Editor) {
        super.registerEditor(editor);
        this.registerCalled = true;
    }

}

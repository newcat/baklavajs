import { ViewPlugin } from "../viewPlugin";

import { IStep } from "./step";
import NodeStep from "./nodeStep";
import ConnectionStep from "./connectionStep";

export default class History {

    public maxSteps = 200;

    private viewPlugin: ViewPlugin;
    private steps: IStep[] = [];
    private changeBySelf = false;
    private currentIndex = -1;

    private activeTransaction = false;
    private transactionSteps: IStep[] = [];

    public constructor(viewPlugin: ViewPlugin) {
        this.viewPlugin = viewPlugin;
        this.viewPlugin.editor.events.addNode.addListener(this, (node) => {
            this.addStep(new NodeStep("addNode", node.id));
        });
        this.viewPlugin.editor.events.removeNode.addListener(this, (node) => {
            this.addStep(new NodeStep("removeNode", node.save()));
        });
        this.viewPlugin.editor.events.addConnection.addListener(this, (conn) => {
            this.addStep(new ConnectionStep("addConnection", conn.id));
        });
        this.viewPlugin.editor.events.removeConnection.addListener(this, (conn) => {
            this.addStep(new ConnectionStep("removeConnection", conn));
        });
    }

    public startTransaction() {
        this.activeTransaction = true;
    }

    public commitTransaction() {
        this.activeTransaction = false;
    }

    public undo() {
        if (this.steps.length === 0 || this.currentIndex === -1) { return; }
        this.changeBySelf = true;
        this.steps[this.currentIndex--].undo(this.viewPlugin.editor);
        this.changeBySelf = false;
    }

    public redo() {
        if (this.steps.length === 0 || this.currentIndex >= this.steps.length - 1) { return; }
        this.changeBySelf = true;
        this.steps[++this.currentIndex].redo(this.viewPlugin.editor);
        this.changeBySelf = false;
    }

    private addStep(step: IStep) {
        if (this.changeBySelf) {
            return;
        }

        if (this.activeTransaction) {
            this.transactionSteps.push(step);
        } else {

            if (this.currentIndex !== this.steps.length - 1) {
                this.steps = this.steps.slice(0, this.currentIndex + 1);
            }

            this.steps.push(step);
            this.currentIndex++;

            while (this.steps.length > this.maxSteps) {
                this.steps.shift();
            }

        }
    }

}

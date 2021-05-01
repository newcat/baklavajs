import { Graph } from "@baklavajs/core";
import { IStep } from "./step";
import NodeStep from "./nodeStep";
import ConnectionStep from "./connectionStep";
import TransactionStep from "./transactionStep";

export default class History {
    public maxSteps = 200;

    private steps: IStep[] = [];
    private changeBySelf = false;
    private currentIndex = -1;
    private activeGraph: Graph;

    private activeTransaction = false;
    private transactionSteps: IStep[] = [];

    constructor(graph: Graph) {
        this.activeGraph = graph;
        this.subscribe(graph);
    }

    public setActiveGraph(graph: Graph) {
        this.unsubscribe(this.activeGraph);
        this.activeGraph = graph;
        this.subscribe(graph);
    }

    public startTransaction() {
        this.activeTransaction = true;
    }

    public commitTransaction() {
        this.activeTransaction = false;
        if (this.transactionSteps.length > 0) {
            this.addStep(new TransactionStep(this.transactionSteps));
            this.transactionSteps = [];
        }
    }

    public undo() {
        if (this.steps.length === 0 || this.currentIndex === -1) {
            return;
        }
        this.changeBySelf = true;
        this.steps[this.currentIndex--].undo(this.activeGraph);
        this.changeBySelf = false;
    }

    public redo() {
        if (this.steps.length === 0 || this.currentIndex >= this.steps.length - 1) {
            return;
        }
        this.changeBySelf = true;
        this.steps[++this.currentIndex].redo(this.activeGraph);
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

    private subscribe(graph: Graph) {
        graph.events.addNode.addListener(this, (node) => {
            this.addStep(new NodeStep("addNode", node.id));
        });
        graph.events.removeNode.addListener(this, (node) => {
            this.addStep(new NodeStep("removeNode", node.save()));
        });
        graph.events.addConnection.addListener(this, (conn) => {
            this.addStep(new ConnectionStep("addConnection", conn.id));
        });
        graph.events.removeConnection.addListener(this, (conn) => {
            this.addStep(new ConnectionStep("removeConnection", conn));
        });
        // TODO: Also add moving nodes to the history
    }

    private unsubscribe(graph: Graph) {
        graph.events.addNode.removeListener(this);
        graph.events.removeNode.removeListener(this);
        graph.events.addConnection.removeListener(this);
        graph.events.removeConnection.removeListener(this);
    }
}

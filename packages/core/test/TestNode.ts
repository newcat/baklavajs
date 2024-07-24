import { AbstractNode, CalculateFunction, Graph, NodeInterface, NodeStatus } from "../src";

export default class TestNode extends AbstractNode {
    public type = "TestNode";
    public inputs = {
        a: new NodeInterface("A", 2),
    };
    public outputs = {
        b: new NodeInterface("B", 2),
    };
    public status = NodeStatus.NONE

    public constructor() {
        super();
        this._title = this.type;
        this.initializeIo();
    }

    public calculate?: CalculateFunction<any, any>;

    public registerCalled = false;

    public registerGraph(graph: Graph) {
        super.registerGraph(graph);
        this.registerCalled = true;
    }
}

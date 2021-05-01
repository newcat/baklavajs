import { AbstractNode, CalculateFunction, Graph, NodeInterface } from "../src";

export default class TestNode extends AbstractNode {
    public type = "TestNode";
    public title = this.type;
    public inputs = {
        a: new NodeInterface("A", 2),
    };
    public outputs = {
        b: new NodeInterface("B", 2),
    };

    public calculate?: CalculateFunction<any, any>;

    public registerCalled = false;

    public registerGraph(graph: Graph) {
        super.registerGraph(graph);
        this.registerCalled = true;
    }
}

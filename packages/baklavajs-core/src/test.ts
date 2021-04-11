import { defineNode, InterfaceFactory } from "./defineNode";
import { AbstractNode, Node } from "./node";
import { NodeInterface, NodeInterfaceDefinition } from "./nodeInterface";

export class CheckboxInterface extends NodeInterface<boolean> {}

const x = {
    simple: () => new CheckboxInterface("A", false),
    advanced: () => new CheckboxInterface("A", true),
};

const TestNode = defineNode({
    type: "TestNode",
    inputs: {
        a: () => new NodeInterface<string>("A", "a"),
        b: () => new NodeInterface<number>("B", 3),
    },
    outputs: {
        c: () => new NodeInterface<string>("C", ""),
    },
    calculate(inputs, globalValues) {
        return Promise.resolve({
            c: inputs.a + inputs.b.toString(),
        });
    },
});

// const n: Node<NodeInterfaceDefinition, NodeInterfaceDefinition> = new TestNode();
const n = new TestNode();

n.inputs.g.save();

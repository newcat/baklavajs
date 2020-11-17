import { CalculateFunction, CalculateFunctionReturnType, INodeInterface, INodeIO, IODefinition, IODefinitionValues } from "../types";
import { Node } from "./node";
import { NodeInterface } from "./nodeInterface";

type SetupReturn<I extends IODefinition, O extends IODefinition> = {
    inputs: I;
    outputs: O;
}

interface INodeDefinition<I extends IODefinition, O extends IODefinition> {
    type: string;
    title?: string;
    setup(): SetupReturn<I, O>;
    calculate?: CalculateFunction<I, O>;
    // onCreate?: (this: Node<I, O>) => void;
}

function defineNode<I extends IODefinition, O extends IODefinition>(definition: INodeDefinition<I, O>) {
    
}

defineNode({
    type: "MyNode",
    setup() {
        return {
            inputs: {
                hello: new NodeInterface(3),
                old: new NodeInterface(false)
            },
            outputs: {
                y: new NodeInterface("test"),
                z: new NodeInterface(2)
            }
        }
    },
    calculate(inputs, test) {
    },
});

import { CalculateFunction, CalculateFunctionReturnType, INodeIO, IODefinition, IODefinitionValues } from "../types";
import { Node } from "./node";
import { NodeInterface } from "./nodeInterface";

interface INodeDefinition<I extends IODefinition, O extends IODefinition> {
    type: string;
    title?: string;
    inputs: I;
    outputs: O;
    defaultValues?: Partial<I & O>;
    calculate?: CalculateFunction<I, O>;
    onCreate?: (this: Node<I, O>) => void;
}

export function defineNode<I extends { [k: string]: INodeIO<unknown> }, O extends IODefinition>(
    definitionFactory: () => INodeDefinition<I, O>
): new () => Node<I, O> {
    const definition = definitionFactory();
    return class extends Node<I, O> {
        public type = definition.type;
        public title = definition.title ?? definition.type;
        public inputs = definition.inputs;
        public outputs = definition.outputs;

        public constructor() {
            super();
            definition.onCreate?.call(this);
        }

        public calculate(inputs: IODefinitionValues<I>, globalValues?: any): CalculateFunctionReturnType<O> {
            definition.calculate?.call(this, inputs, globalValues);
        }
    };
}

defineNode(() => ({
    type: "MyNode",
    inputs: {
        hello: new NodeInterface<number>(3),
        old: new NodeInterface(false),
    },
    outputs: {},
    calculate({ hello, old }, y) {
        
    },
}));

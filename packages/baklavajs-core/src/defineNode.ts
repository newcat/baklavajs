import { CalculateFunction, Node } from "./node";
import { INodeIO } from "./nodeIO";

export type NodeIOFactory<T> = () => INodeIO<T>;
export type IOFactory = Record<string, NodeIOFactory<unknown>>;

type FactoryToDefinition<D extends IOFactory> = {
    [K in keyof D]: D[K] extends NodeIOFactory<infer T> ? INodeIO<T> : never;
};

// eslint-disable-next-line @typescript-eslint/ban-types
interface INodeDefinition<I extends IOFactory = {}, O extends IOFactory = {}> {
    type: string;
    title?: string;
    inputs?: I;
    outputs?: O;
    calculate?: CalculateFunction<FactoryToDefinition<I>, FactoryToDefinition<O>>;
    onCreate?: (this: Node<FactoryToDefinition<I>, FactoryToDefinition<O>>) => void;
}

function executeFactory<T extends IOFactory>(factory?: T): FactoryToDefinition<T> {
    const res: Record<string, INodeIO<unknown>> = {};
    Object.keys(factory || {}).forEach((k) => {
        res[k] = factory![k]();
    });
    return res as FactoryToDefinition<T>;
}

export function defineNode<I extends IOFactory, O extends IOFactory>(
    definition: INodeDefinition<I, O>
): new () => Node<FactoryToDefinition<I>, FactoryToDefinition<O>> {
    return class extends Node<FactoryToDefinition<I>, FactoryToDefinition<O>> {
        public type = definition.type;
        public title = definition.title ?? definition.type;
        public inputs: FactoryToDefinition<I> = executeFactory(definition.inputs);
        public outputs: FactoryToDefinition<O> = executeFactory(definition.outputs);

        constructor() {
            super();
            definition.onCreate?.call(this);
        }
    };
}

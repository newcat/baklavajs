import { CalculateFunction, Node } from "./node";
import { NodeInterface } from "./nodeInterface";

export type NodeInterfaceFactory<T> = () => NodeInterface<T>;
export type InterfaceFactory = Record<string, NodeInterfaceFactory<unknown>>;

type FactoryToDefinition<D extends InterfaceFactory> = {
    [K in keyof D]: D[K] extends NodeInterfaceFactory<infer T> ? NodeInterface<T> : never;
};

// eslint-disable-next-line @typescript-eslint/ban-types
interface INodeDefinition<I extends InterfaceFactory = {}, O extends InterfaceFactory = {}> {
    type: string;
    title?: string;
    inputs?: I;
    outputs?: O;
    calculate?: CalculateFunction<FactoryToDefinition<I>, FactoryToDefinition<O>>;
    onCreate?: (this: Node<FactoryToDefinition<I>, FactoryToDefinition<O>>) => void;
}

function executeFactory<T extends InterfaceFactory>(factory?: T): FactoryToDefinition<T> {
    const res: Record<string, NodeInterface> = {};
    Object.keys(factory || {}).forEach((k) => {
        res[k] = factory![k]();
    });
    return res as FactoryToDefinition<T>;
}

export function defineNode<I extends InterfaceFactory, O extends InterfaceFactory>(
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

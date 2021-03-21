import type { NodeInterface, NodeInterfaceDefinition } from "./nodeInterface";
import { CalculateFunction, Node } from "./node";

export type NodeConstructor<I extends NodeInterfaceDefinition, O extends NodeInterfaceDefinition> = new () => Node<
    I,
    O
>;
export type NodeInstanceOf<T> = T extends new () => Node<infer A, infer B> ? Node<A, B> : never;
export type NodeInterfaceFactory<T> = () => NodeInterface<T>;
export type InterfaceFactory = Record<string, NodeInterfaceFactory<any>>;

export type FactoryToDefinition<D extends InterfaceFactory> = {
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

export function defineNode<I extends InterfaceFactory, O extends InterfaceFactory>(
    definition: INodeDefinition<I, O>
): new () => Node<FactoryToDefinition<I>, FactoryToDefinition<O>> {
    return class extends Node<FactoryToDefinition<I>, FactoryToDefinition<O>> {
        public type = definition.type;
        public title = definition.title ?? definition.type;
        public inputs: FactoryToDefinition<I> = {} as any;
        public outputs: FactoryToDefinition<O> = {} as any;

        constructor() {
            super();
            this.executeFactory("input", definition.inputs);
            this.executeFactory("output", definition.outputs);
            definition.onCreate?.call(this);
        }

        private executeFactory<T extends InterfaceFactory>(type: "input" | "output", factory?: T): void {
            Object.keys(factory || {}).forEach((k) => {
                const intf = factory![k]();
                if (type === "input") {
                    this.addInput(k, intf);
                } else {
                    this.addOutput(k, intf);
                }
            });
        }
    };
}

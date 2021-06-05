import type { NodeInterface, NodeInterfaceDefinition } from "./nodeInterface";
import { CalculateFunction, Node } from "./node";

export type NodeConstructor<I, O> = new () => Node<I, O>;
export type NodeInstanceOf<T> = T extends new () => Node<infer A, infer B> ? Node<A, B> : never;

export type NodeInterfaceFactory<T> = () => NodeInterface<T>;
export type InterfaceFactory<T> = {
    [K in keyof T]: NodeInterfaceFactory<T[K]>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
interface INodeDefinition<I, O> {
    type: string;
    title?: string;
    inputs?: InterfaceFactory<I>;
    outputs?: InterfaceFactory<O>;
    calculate?: CalculateFunction<I, O>;
    onCreate?: (this: Node<I, O>) => void;
    onPlaced?: (this: Node<I, O>) => void;
    onDestroy?: (this: Node<I, O>) => void;
}

export function defineNode<I, O>(definition: INodeDefinition<I, O>): new () => Node<I, O> {
    return class extends Node<I, O> {
        public type = definition.type;
        public title = definition.title ?? definition.type;
        public inputs: NodeInterfaceDefinition<I> = {} as any;
        public outputs: NodeInterfaceDefinition<O> = {} as any;

        constructor() {
            super();
            this.executeFactory("input", definition.inputs);
            this.executeFactory("output", definition.outputs);
            definition.onCreate?.call(this);
        }

        public calculate = (inputs: I, globalValues: any) => {
            return definition.calculate?.call(this, inputs, globalValues);
        };

        public onPlaced() {
            definition.onPlaced?.call(this);
        }

        public onDestroy() {
            definition.onDestroy?.call(this);
        }

        private executeFactory<V, T extends InterfaceFactory<V>>(type: "input" | "output", factory?: T): void {
            (Object.keys(factory || {}) as (keyof V)[]).forEach((k) => {
                const intf = factory![k]();
                if (type === "input") {
                    this.addInput(k as string, intf);
                } else {
                    this.addOutput(k as string, intf);
                }
            });
        }
    };
}

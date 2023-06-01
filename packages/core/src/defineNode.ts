import type { NodeInterface, NodeInterfaceDefinition } from "./nodeInterface";
import { CalculateFunction, Node } from "./node";

export type NodeConstructor<I, O> = new () => Node<I, O>;
export type NodeInstanceOf<T> = T extends new () => Node<infer A, infer B> ? Node<A, B> : never;

export type NodeInterfaceFactory<T> = () => NodeInterface<T>;
export type InterfaceFactory<T> = {
    [K in keyof T]: NodeInterfaceFactory<T[K]>;
};

export interface INodeDefinition<I, O> {
    /** NodeType */
    type: string;
    /** Default title when creating the node. If not specified, it is set to the nodeType */
    title?: string;
    /** Inputs of the node */
    inputs?: InterfaceFactory<I>;
    /** Outputs of the node */
    outputs?: InterfaceFactory<O>;
    /** This function is called by the engine with the input values.
     * It should perform the necessary calculation and then return the output values */
    calculate?: CalculateFunction<I, O>;
    /** Called as soon as an instance of the node is created but before it is placed into a graph */
    onCreate?: (this: Node<I, O>) => void;
    /** Called when the node is placed into a graph */
    onPlaced?: (this: Node<I, O>) => void;
    /** Called after the node is removed from a graph. Can be used for cleanup */
    onDestroy?: (this: Node<I, O>) => void;
}

export function defineNode<I, O>(definition: INodeDefinition<I, O>): new () => Node<I, O> {
    return class extends Node<I, O> {
        public readonly type = definition.type;
        public inputs: NodeInterfaceDefinition<I> = {} as any;
        public outputs: NodeInterfaceDefinition<O> = {} as any;

        constructor() {
            super();
            this._title = definition.title ?? definition.type;
            this.executeFactory("input", definition.inputs);
            this.executeFactory("output", definition.outputs);
            definition.onCreate?.call(this);
        }

        public calculate = definition.calculate
            ? (inputs: I, globalValues: any) => {
                return definition.calculate!.call(this, inputs, globalValues);
            }
            : undefined;

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

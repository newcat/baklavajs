import { FactoryToDefinition, InterfaceFactory, NodeInterfaceFactory } from "./defineNode";
import { NodeInterface, NodeInterfaceDefinition } from "./nodeInterface";

export class CheckboxInterface extends NodeInterface<boolean> {}

const x = {
    simple: () => new CheckboxInterface("A", false),
    advanced: () => new CheckboxInterface("A", true),
};

declare function ftonormal<F extends InterfaceFactory>(v: F): FactoryToDefinition<F>;

const y = ftonormal(x);

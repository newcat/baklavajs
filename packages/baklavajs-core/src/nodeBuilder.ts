import { IODefinition, IODefinitionValues } from "../types";
import { AbstractNode, Node } from "./node";

interface IInterfaceOptions {
    isInput: boolean;
    name: string;
    option?: string;
    defaultValue?: any;
    additionalProperties?: Record<string, any>;
}

interface INodeOptionParameters {
    value: string;
    optionComponent: string;
    sidebarComponent?: string;
    additionalProperties?: Record<string, any>;
}

type CalculationFunction<I extends IODefinition, O extends IODefinition> = (
    this: Node<I, O>,
    n: Node<I, O>,
    inputs: IODefinitionValues<I>,
    globalValues?: any
) => IODefinitionValues<O> | Promise<IODefinitionValues<O>> | void;
type NodeConstructorImpl = new () => AbstractNode;

function getDefaultValue(v: any) {
    if (typeof v === "function") {
        return v();
    } else {
        return v;
    }
}

function generateNode<I extends IODefinition, O extends IODefinition>(
    type: string,
    title: string,
    inputs: I,
    outputs: O,
    calcFunction?: CalculationFunction<I, O>
) {
    return class extends Node<I, O> {
        type = type;
        title = title;
        inputs = inputs;
        outputs = outputs;

        constructor() {
            super();
        }

        public calculate(calculationData?: any): any {
            if (calcFunction) {
                return calcFunction.call(this, this, calculationData);
            }
        }
    };
}

/** Utility class for creating custom nodes */
export class NodeBuilder {
    private type = "";
    private title = "";
    private intfs: IInterfaceOptions[] = [];
    private options: Map<string, INodeOptionParameters> = new Map();
    private calcFunction?: CalculationFunction;

    /**
     * Create a new NodeBuilder instance
     * @param type Type of the node to create
     * @param additionalProperties Additional properties that can be used by plugins
     */
    public constructor(type: string, additionalProperties?: Record<string, any>) {
        this.type = type;
        this.name = type;
        this.additionalProperties = additionalProperties;
    }

    /**
     * Build the node class.
     * This must be called as the last operation when building a node.
     * @returns The generated node class
     */
    public build(): NodeConstructorImpl {
        return generateNode(
            this.type,
            this.name,
            this.additionalProperties,
            this.intfs,
            this.options,
            this.calcFunction
        );
    }

    /**
     * Set a display name for the node.
     * @param name New name of the node
     * @returns Current node builder instance for chaining
     */
    public setName(name: string): NodeBuilder {
        this.name = name;
        return this;
    }

    /**
     * Add an input interface to the node
     * @param name Name of the interface
     * @param type Type of the interface
     * @param option A node option component to be displayed when the interface is not connected
     * @param defaultValue
     * Default value for the interface.
     * If the default value is a primitive (e. g. string, number) then the value can be passed directly.
     * For objects provide a function that returns the default value.
     * @param additionalProperties Additional properties of the interface that can be used by plugins
     * @returns Current node builder instance for chaining
     */
    public addInputInterface(
        name: string,
        option?: string,
        defaultValue: any = null,
        additionalProperties?: Record<string, any>
    ): NodeBuilder {
        this.checkDefaultValue(defaultValue);
        this.intfs.push({ isInput: true, name, option, defaultValue, additionalProperties });
        return this;
    }

    /**
     * Add an output interface to the node
     * @param name Name of the interface
     * @param additionalProperties Additional properties of the interface that can be used by plugins
     * @returns Current node builder instance for chaining
     */
    public addOutputInterface(name: string, additionalProperties?: Record<string, any>): NodeBuilder {
        this.intfs.push({ isInput: false, name, additionalProperties });
        return this;
    }

    /**
     * Add a node option to the node
     * @param name Name of the option
     * @param component Option component
     * @param defaultValue
     * Default value for the option.
     * If the default value is a primitive (e. g. string, number) then the value can be passed directly.
     * For objects provide a function that returns the default value.
     * @param sidebarComponent Optional component to display in the sidebar
     * @param additionalProperties Additional properties of the option that can be used by plugins
     * @returns Current node builder instance for chaining
     */
    public addOption(
        name: string,
        optionComponent: string,
        defaultValue: any = null,
        sidebarComponent?: string,
        additionalProperties?: Record<string, any>
    ): NodeBuilder {
        this.checkDefaultValue(defaultValue);
        this.options.set(name, {
            value: defaultValue,
            optionComponent,
            sidebarComponent,
            additionalProperties,
        });
        return this;
    }

    /**
     * Register a callback for the calculation function.
     * The callback will receive the node instance as first parameter.
     * (If you do not use ES6 arrow functions, the node instance
     * will also be bound to `this`)
     * @param cb Callback to be executed when `calculate()` is called on the node
     * @returns Current node builder instance for chaining
     */
    public onCalculate(cb: CalculationFunction): NodeBuilder {
        this.calcFunction = cb;
        return this;
    }

    private checkDefaultValue(v: any) {
        if (typeof v === "object" && v !== null) {
            throw new Error("If the default value is an object, provide a generator function instead of the object");
        }
    }
}

import { Node, NodeConstructor, IOption } from ".";

interface IInterfaceOptions {
    isInput: boolean;
    name: string;
    option?: string;
    defaultValue?: any;
    additionalProperties?: Record<string, any>;
}

type CalculationFunction = (this: Node, n: Node) => any;

function getDefaultValue(v: any) {
    if (typeof(v) === "function") {
        return v();
    } else {
        return v;
    }
}

function generateNode(
    type: string, intfs: IInterfaceOptions[],
    options: Map<string, IOption>, calcFunction?: CalculationFunction
) {
    return class extends Node {

        type = type;
        name = type;

        constructor() {
            super();
            for (const i of intfs) {
                if (i.isInput) {
                    this.addInputInterface(i.name, i.option, getDefaultValue(i.defaultValue), i.additionalProperties);
                } else {
                    this.addOutputInterface(i.name, i.additionalProperties);
                }
            }
            Array.from(options.entries()).forEach(([k, v]) => {
                this.addOption(k, v.optionComponent, getDefaultValue(v.value), v.sidebarComponent);
            });
        }

        public calculate(): any {
            if (calcFunction) {
                return calcFunction.call(this, this);
            }
        }

    };
}

/** Utility class for creating custom nodes */
export class NodeBuilder {

    private name = "";
    private intfs: IInterfaceOptions[] = [];
    private options: Map<string, IOption> = new Map();
    private calcFunction?: CalculationFunction;

    public constructor(name: string) {
        this.name = name;
    }

    /**
     * Build the node class.
     * This must be called as the last operation when building a node.
     * @returns The generated node class
     */
    public build(): NodeConstructor {
        return generateNode(this.name, this.intfs, this.options, this.calcFunction) as NodeConstructor;
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
    public addInputInterface(name: string, option?: string, defaultValue?: any, additionalProperties?: Record<string, any>): NodeBuilder {
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
        this.intfs.push({ isInput: false, name });
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
    public addOption(name: string, optionComponent: string, defaultValue?: any,
                     sidebarComponent?: string, additionalProperties?: Record<string, any>): NodeBuilder {
        this.checkDefaultValue(defaultValue);
        this.options.set(name, {
            value: defaultValue,
            optionComponent,
            sidebarComponent
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
        if (typeof(v) === "object") {
            throw new Error("If the default value is an object, provide a generator function instead of the object");
        }
    }

}

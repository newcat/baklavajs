import { VueConstructor } from "vue";
import { Node, NodeConstructor, IOption } from ".";

interface IInterfaceOptions {
    isInput: boolean;
    name: string;
    type: string;
    option?: VueConstructor;
    defaultValue?: any;
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
    options: Record<string, IOption>, calcFunction?: CalculationFunction
) {
    return class extends Node {

        type = type;
        name = type;

        constructor() {
            super();
            for (const i of intfs) {
                if (i.isInput) {
                    this.addInputInterface(i.name, i.type, i.option, getDefaultValue(i.defaultValue));
                } else {
                    this.addOutputInterface(i.name, i.type);
                }
            }
            this.options = {};
            Object.entries(options).forEach(([k, v]) => {
                this.options[k] = {
                    component: v.component,
                    data: getDefaultValue(v.data),
                    sidebarComponent: v.sidebarComponent
                };
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
    private options: Record<string, IOption> = {};
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
     * @returns Current node builder instance for chaining
     */
    public addInputInterface(name: string, type: string, option?: VueConstructor, defaultValue?: any): NodeBuilder {
        this.checkDefaultValue(defaultValue);
        this.intfs.push({ isInput: true, name, type, option, defaultValue });
        return this;
    }

    /**
     * Add an output interface to the node
     * @param name Name of the interface
     * @param type Type of the interface
     * @returns Current node builder instance for chaining
     */
    public addOutputInterface(name: string, type: string): NodeBuilder {
        this.intfs.push({ isInput: false, name, type });
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
     * @returns Current node builder instance for chaining
     */
    public addOption(name: string, component: VueConstructor,
                     defaultValue?: any, sidebarComponent?: VueConstructor): NodeBuilder {
        this.checkDefaultValue(defaultValue);
        this.options[name] = {
            data: defaultValue,
            component,
            sidebarComponent
        };
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
